const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const { T } = require("../../lib/i18n");

module.exports = {
    name: "trackError",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        const errorMessage = payload?.exception?.message ?? payload?.message ?? "unknown";
        const severity = String(payload?.exception?.severity ?? "COMMON").toUpperCase();
        global.log.error(`Track error on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} — ${errorMessage} (${severity})`);
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (severity === "COMMON") {
            const t = T(player.guildId);
            if (channel) await channel.send(reply(`### ${EMOJI.error} ${t.trackError || "Track failed, skipped"}`, track?.info?.title ? `**${track.info.title}**` : "")).catch(() => { });
            return;
        }
        const trackKey = track?.info?.identifier ?? track?.info?.uri ?? track?.info?.title;
        const attempts = player.getData("trackErrorFailover") ?? { key: trackKey, nodes: [] };
        if (attempts.key !== trackKey) {
            attempts.key = trackKey;
            attempts.nodes = [];
        }
        const otherNodes = [...ctx.lavalink.nodeManager.nodes.values()].filter(n => n.connected && n.sessionId && n.id !== player.node?.id && !attempts.nodes.includes(n.id))
            .sort((a, b) => (a.stats?.playingPlayers ?? 0) - (b.stats?.playingPlayers ?? 0));
        if (["FAULT", "SUSPICIOUS"].includes(severity) && trackKey && otherNodes.length) {
            const oldNode = player.node?.id;
            const targetNode = otherNodes[0];
            attempts.nodes.push(oldNode);
            player.setData("trackErrorFailover", attempts);
            try {
                await player.moveNode(targetNode.id);
                global.log.warn(`Track error (${severity}) on ${player.guildId}: moved player with current track from ${oldNode} to ${targetNode.id}`);
                return;
            } catch (error) {
                global.log.warn(`Track error failover on ${player.guildId} failed: ${error?.message ?? error}`);
            }
        }
        const t = T(player.guildId);
        if (channel) await channel.send(reply(`### ${EMOJI.error} ${t.trackError || "Track failed, skipped"}`, track?.info?.title ? `**${track.info.title}**` : "")).catch(() => { });
    }
};
