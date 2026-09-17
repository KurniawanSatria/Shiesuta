const { T } = require("../../lib/i18n");
const { nowPlayingCard } = require("../../lib/ui");
const { purge, clearIdle, fetchLyrics, parseLrc } = require("../../lib/utils");
const state = require("../../lib/state");

module.exports = {
    name: "trackStart",
    emitter: "lavalink",
    async run(ctx, player, track) {
        global.log.debug(`[${player.guildId}] playing ${track.info.title}`);
        clearIdle(player.guildId);
        await purge(player.guildId);
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const t = T(player.guildId);
        const requester = track.requester?.toString() ?? t.unknown;
        const info = track.info;
        const lyrics = await fetchLyrics({ info });
        const lines = lyrics?.syncedLyrics ? parseLrc(lyrics.syncedLyrics) : [];
        const msg = await channel.send(nowPlayingCard(player.guildId, { info }, requester, lines, 0)).catch(() => null);
        if (!msg) return;
        state.pending.set(player.guildId, [msg]);
        state.npState.set(player.guildId, { msg, track: info, requester, lines, last: 0 });
    }
};
