const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const { T } = require("../../lib/i18n");

module.exports = {
    name: "trackError",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        global.log.error(`Track error on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} — ${payload?.exception?.message ?? payload?.message ?? "unknown"}`);
        const trackKey = track?.info?.identifier ?? track?.info?.uri ?? track?.info?.title;
        if (trackKey && player.getData("trackErrorFailover") !== trackKey) {
            player.setData("trackErrorFailover", trackKey);
            try {
                const oldNode = player.node?.id;
                const newNode = await player.moveNode();
                global.log.warn(`Track error on ${player.guildId}: moved player from ${oldNode} to ${newNode}`);
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
