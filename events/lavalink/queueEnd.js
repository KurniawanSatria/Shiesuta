const { T } = require("../../lib/i18n");
const { EMOJI } = require("../../lib/emoji");
const { card } = require("../../lib/ui");
const { purge, startIdle } = require("../../lib/utils");
const state = require("../../lib/state");

module.exports = {
    name: "queueEnd",
    emitter: "lavalink",
    async run(ctx, player, track, payload) {
        global.log.debug(`[${player.guildId}] queueEnd: Queue finished`);
        state.npState.delete(player.guildId);
        await purge(player.guildId);
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        const vc = player.voiceChannelId ? ctx.client.channels.cache.get(player.voiceChannelId) : null;
        const mentions = vc?.members?.filter(m => !m.user.bot).map(m => m.toString()).join(" ");
        let endedMsg = null;
        if (channel) endedMsg = await channel.send(card({
            title: `## ${EMOJI.music} ${T(player.guildId).queueEndedTitle}`,
            body: `${mentions ? `${mentions}\n` : ""}${T(player.guildId).queueEnded} <t:${Math.floor(Date.now() / 1000) + 60}:R>`,
            thumb: ctx.client.user.displayAvatarURL()
        })).catch(() => { });
        startIdle(ctx.client, player.guildId);
        setTimeout(() => endedMsg?.delete().catch(() => { }), 60_000);
    }
};
