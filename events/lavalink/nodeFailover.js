const { T } = require("../../lib/i18n");
const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const db = require("../../lib/db");

async function handleNodeFailover(ctx, node, reason) {
    const affectedPlayers = [...ctx.lavalink.players.values()].filter(p => p.node?.id === node.id);
    if (!affectedPlayers.length) return;

    global.log.warn(`Node ${node.id} disconnected, attempting failover for ${affectedPlayers.length} player(s)`);

    const availableNodes = [...ctx.lavalink.nodeManager.nodes.values()].filter(n => n.connected && n.id !== node.id);
    if (!availableNodes.length) {
        global.log.error(`Node ${node.id} down — no healthy nodes available for failover`);
        for (const player of affectedPlayers) {
            const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
            const t = T(player.guildId);
            if (channel) await channel.send(reply(`### ${EMOJI.error} ${t.nodeDown || "Music server unavailable, playback stopped."}`, "")).catch(() => {});
        }
        return;
    }

    for (const player of affectedPlayers) {
        try {
            const targetNode = availableNodes[0];
            const position = player.position;
            const currentTrack = player.queue.current;
            const wasPlaying = player.playing;
            const volume = player.volume;
            const queue = [...player.queue];
            const voiceChannelId = player.voiceChannelId;
            const textChannelId = player.textChannelId;
            const guildId = player.guildId;

            global.log.info(`Moving player ${guildId} from ${node.id} to ${targetNode.id} at ${position}ms`);

            await player.destroy("Node failover").catch(() => {});

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

            if (currentTrack) {
                await newPlayer.queue.add(currentTrack);
                if (wasPlaying) {
                    await newPlayer.play();
                    await newPlayer.seek(position).catch(() => {});
                }
            }

            for (const track of queue.slice(1)) {
                await newPlayer.queue.add(track);
            }

            global.log.info(`Player ${guildId} successfully failed over to ${targetNode.id}`);

            const channel = textChannelId ? ctx.client.channels.cache.get(textChannelId) : null;
            const t = T(guildId);
            if (channel && currentTrack) {
                await channel.send(reply(`### ${EMOJI.skip} ${t.nodeSwitched || "Switched music server"}`, `Resumed **${currentTrack.info.title}** at ${Math.floor(position / 1000)}s`)).catch(() => {});
            }
        } catch (e) {
            global.log.error(`Failover failed for ${player.guildId}: ${e?.message ?? e}`);
            const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
            const t = T(player.guildId);
            if (channel) await channel.send(reply(`### ${EMOJI.error} ${t.nodeFailoverFailed || "Failed to switch music server, playback stopped."}`, "")).catch(() => {});
        }
    }
}

module.exports = { handleNodeFailover };