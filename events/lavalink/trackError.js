const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const { T } = require("../../lib/i18n");
const { restartBackupNode } = require("./nodeFailover");

module.exports = {
    name: "trackError",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        const errorMessage = payload?.exception?.message ?? payload?.message ?? "unknown";
        global.log.error(`Track error on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} — ${errorMessage}`);
        const trackKey = track?.info?.identifier ?? track?.info?.uri ?? track?.info?.title;
        const otherNodes = [...ctx.lavalink.nodeManager.nodes.values()].filter(n => n.connected && n.id !== player.node?.id);
        if (trackKey && otherNodes.length && player.getData("trackErrorFailover") !== trackKey) {
            player.setData("trackErrorFailover", trackKey);
            try {
                const oldNode = player.node?.id;
                const newNode = await player.moveNode();
                global.log.warn(`Track error on ${player.guildId}: moved player from ${oldNode} to ${newNode}`);
                if (!oldNode) return global.log.warn(`Lavalink restart skipped after move on ${player.guildId}: source node is unknown`);
                global.log.warn(`Restarting Lavalink node ${oldNode} after player move on ${player.guildId}`);
                const restarted = await restartBackupNode({ id: oldNode });
                global.log.info(`Lavalink ${oldNode} restart ${restarted ? "completed" : "was not requested"} after player move on ${player.guildId}`);
                return;
            } catch (error) {
                global.log.warn(`Track error failover on ${player.guildId} failed: ${error?.message ?? error}`);
            }
        }
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const t = T(player.guildId);
        await channel.send(reply(`### ${EMOJI.error} ${t.trackError || "Track failed, skipped"}`, track?.info?.title ? `**${track.info.title}**` : "")).catch(() => { });
    }
};
