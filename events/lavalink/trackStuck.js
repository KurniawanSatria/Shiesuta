const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const { T } = require("../../lib/i18n");

module.exports = {
    name: "trackStuck",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        // Skipping itself is automatic (autoSkip: true); tell the user why.
        global.log.error(`Track stuck on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} at position ${payload?.thresholdMs ?? "unknown"}`);
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const t = T(player.guildId);
        await channel.send(reply(`### ${EMOJI.error} ${t.trackStuck || "Track stuck, skipped"}`, track?.info?.title ? `**${track.info.title}**` : "")).catch(() => { });
    }
};
