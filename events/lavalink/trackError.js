const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const { T } = require("../../lib/i18n");

module.exports = {
    name: "trackError",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        // Skipping itself is automatic (autoSkip: true + maxErrorsPerTime destroys
        // the player after repeated failures); tell the user why.
        global.log.error(`Track error on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} — ${payload?.exception?.message ?? payload?.message ?? "unknown"}`);
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const t = T(player.guildId);
        await channel.send(reply(`### ${EMOJI.error} ${t.trackError || "Track failed, skipped"}`, track?.info?.title ? `**${track.info.title}**` : "")).catch(() => { });
    }
};
