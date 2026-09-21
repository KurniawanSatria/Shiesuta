const { T } = require("../../lib/i18n");
const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");

module.exports = {
    name: "queueEnd",
    emitter: "lavalink",
    async run(ctx, player) {
        global.log.info(`Queue ended on ${player.guildId} ${player.guild?.name ?? ""} — leaving in 60s if idle (onEmptyQueue.destroyAfterMs)`);
        const t = T(player.guildId);
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const title = t.queueEndedTitle ?? "Queue Ended";
        const body = t.queueEnded ?? "-# Queue ended.";
        await channel.send(reply(`### ${EMOJI.cd ?? EMOJI.audio_wave} ${title}`, `${body}`)).catch(() => { });
    }
};
