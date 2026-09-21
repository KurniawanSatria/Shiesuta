const state = require("../../lib/state");
const { nowPlayingCard } = require("../../lib/ui");

module.exports = {
    name: "playerUpdate",
    emitter: "lavalink",
    async run(ctx, player) {
        const guildId = player.guildId;
        const position = player.position / 1000;
        const st = state.npState.get(guildId);
        if (!st || player.paused) return;
        const i = st.lines?.length ? st.lines.findLastIndex(line => line.time <= position) : -1;
        if (st.lyricsVisible && st.lines?.length && i === st.last) return;
        const now = Date.now();
        if (!st.lyricsVisible && i === st.last && now - (st.lastEdit ?? 0) < 5000) return;
        st.last = i;
        st.lastEdit = now;
        st.msg.edit(nowPlayingCard(guildId, player, { info: st.track }, st.requester, st.lines, position, st.lyricsVisible)).catch(() => { });
    }
};
