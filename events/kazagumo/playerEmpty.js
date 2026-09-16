const { T } = require("../../lib/i18n");
const { EMOJI } = require("../../lib/emoji");
const { card } = require("../../lib/ui");
const { purge, clearIdle, stopLyrics, startIdle } = require("../../lib/utils");
const state = require("../../lib/state");

module.exports = {
    name: "playerEmpty",
    emitter: "kazagumo",
    async run(ctx, player) {
        global.log.debug(`[${player.guildId}] playerEmpty: Stopping player`);
        stopLyrics(player.guildId);
        state.npState.delete(player.guildId);
        await purge(player.guildId);
        const channel = ctx.client.channels.cache.get(player.textId);
        const vc = ctx.client.channels.cache.get(player.voiceId);
        const mentions = vc?.members.filter(m => !m.user.bot).map(m => m.toString()).join(" ");
        let endedMsg = null;
        if (channel) endedMsg = await channel.send(card({title: `## ${EMOJI.music} ${T(player.guildId).queueEndedTitle}`,
 body: `${mentions ? `${mentions}\n` : ""}${T(player.guildId).queueEnded} <t:${Math.floor(Date.now() / 1000) + 60}:R>`, thumb: channel.client.user.displayAvatarURL() })).catch(() => { });
        startIdle(ctx.kazagumo, player.guildId);
        setTimeout(() => endedMsg?.delete().catch(() => { }), 60_000);
    }
};
