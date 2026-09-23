const { T } = require("../../lib/i18n");
const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const db = require("../../lib/db");
const state = require("../../lib/state");
const cfg = require("../../config.json");

async function findPanelServer(panel, nodeId) {
    const baseUrl = String(panel.url ?? "https://panel.saturia.codes").replace(/\/+$/, "").replace(/\/api$/, "");
    const res = await fetch(`${baseUrl}/api/client/servers?page=1&per_page=100&other=false`, { headers: { Authorization: `Bearer ${panel.token}` } });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`server list returned ${res.status}${body.errors ? `: ${[].concat(body.errors).map(e => e?.detail ?? e?.code ?? e).join(", ")}` : ""}`);
    const raw = body.servers ?? body.data ?? body;
    const servers = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.servers) ? raw.servers : raw?.attributes ? [raw] : Object.values(typeof raw === "object" && raw ? raw : {}).filter(v => v?.attributes);
    const server = servers.find(({ attributes }) => attributes?.name === nodeId);
    return server?.attributes?.identifier ?? server?.attributes?.uuid ?? null;
}

async function restartBackupNode(node) {
    const panel = cfg.panel;
    if (!panel?.token) return global.log.warn(`Lavalink ${node.id} restart skipped: panel token is not configured`) || false;
    const baseUrl = String(panel.url ?? "https://panel.saturia.codes").replace(/\/+$/, "").replace(/\/api$/, "");
    try {
        const serverUuid = await findPanelServer(panel, node.id);
        if (!serverUuid) return global.log.warn(`Lavalink ${node.id} restart skipped: no matching panel server`) || false;
        const url = `${baseUrl}/api/client/servers/${serverUuid}/power`;
        const stop = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${panel.token}` },
            body: JSON.stringify({ action: "stop" })
        });
        if (!stop.ok) throw new Error(`stop returned ${stop.status}`);
        const kill = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${panel.token}` },
            body: JSON.stringify({ action: "kill" })
        });
        if (!kill.ok) throw new Error(`kill returned ${kill.status}`);
        const start = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${panel.token}` },
            body: JSON.stringify({ action: "start" })
        });
        if (!start.ok) throw new Error(`start returned ${start.status}`);
        global.log.info(`Lavalink ${node.id} restart requested through panel`);
        return true;
    } catch (error) {
        global.log.error(`Lavalink ${node.id} panel restart failed: ${error?.message ?? error}`);
        return false;
    }
}

async function handleNodeFailover(ctx, node, reason) {
    restartBackupNode(node);
    const affectedPlayers = [...ctx.lavalink.players.values()].filter(p => p.node?.id === node.id);
    if (!affectedPlayers.length) return;

    global.log.warn(`Node ${node.id} disconnected, attempting failover for ${affectedPlayers.length} player(s)`);

    const availableNodes = [...ctx.lavalink.nodeManager.nodes.values()].filter(n => n.connected && n.id !== node.id)
        .sort((a, b) => (a.stats?.playingPlayers ?? 0) - (b.stats?.playingPlayers ?? 0));
    if (!availableNodes.length) {
        global.log.error(`Node ${node.id} down — no healthy nodes available for failover`);
        for (const player of affectedPlayers) {
            const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
            const t = T(player.guildId);
            if (channel) await channel.send(reply(`### ${EMOJI.error} ${t.nodeDown || "Music server unavailable, playback stopped."}`, "")).catch(() => { });
        }
        return;
    }

    const load = new Map(availableNodes.map(n => [n.id, n.stats?.playingPlayers ?? 0]));
    for (const player of affectedPlayers) {
        try {
            const targetNode = availableNodes.reduce((a, b) => load.get(a.id) <= load.get(b.id) ? a : b);
            load.set(targetNode.id, load.get(targetNode.id) + 1);
            const position = player.position;
            const currentTrack = player.queue.current;
            const wasPlaying = player.playing;
            const wasPaused = player.paused;
            const repeatMode = player.repeatMode ?? "off";
            const volume = player.volume;
            const queue = player.queue.tracks ?? [];
            const previous = player.queue.previous ?? [];
            const voiceChannelId = player.voiceChannelId;
            const textChannelId = player.textChannelId;
            const guildId = player.guildId;

            global.log.info(`Moving player ${guildId} from ${node.id} to ${targetNode.id} at ${position}ms`);

            state.failoverGuilds.add(guildId);
            await player.destroy("Node failover").catch(() => { });
            setTimeout(() => state.failoverGuilds.delete(guildId), 15000);

            const settings = await db.get(guildId);
            const newPlayer = await ctx.lavalink.createPlayer({
                guildId,
                voiceChannelId,
                textChannelId,
                selfDeaf: true,
                volume: settings?.volume ?? volume,
                node: targetNode.id
            });

            if (settings?.autoPlay === false) newPlayer.setData("autoplay_disabled", true);
            if (previous.length) newPlayer.queue.previous = previous;
            if (repeatMode !== "off") await newPlayer.setRepeatMode(repeatMode).catch(() => { });

            if (currentTrack) {
                await newPlayer.queue.add(currentTrack);
                if (wasPlaying) {
                    await newPlayer.play();
                    await newPlayer.seek(position).catch(() => { });
                    if (wasPaused) await newPlayer.pause();
                }
            }

            for (const track of queue) {
                await newPlayer.queue.add(track);
            }

            global.log.info(`Player ${guildId} successfully failed over to ${targetNode.id}`);

            const channel = textChannelId ? ctx.client.channels.cache.get(textChannelId) : null;
            const t = T(guildId);
            if (channel && currentTrack) {
                await channel.send(reply(`### ${EMOJI.transfer} ${t.nodeSwitched || "Switched music server"}`, `Resumed **${currentTrack.info.title}** at ${Math.floor(position / 1000)}s`)).catch(() => { });
            }
        } catch (e) {
            global.log.error(`Failover failed for ${player.guildId}: ${e?.message ?? e}`);
            const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
            const t = T(player.guildId);
            if (channel) await channel.send(reply(`### ${EMOJI.error} ${t.nodeFailoverFailed || "Failed to switch music server, playback stopped."}`, "")).catch(() => { });
        }
    }
}

module.exports = { handleNodeFailover, restartBackupNode, findPanelServer };