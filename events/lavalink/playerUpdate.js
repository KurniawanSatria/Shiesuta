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
        if (!st.lines?.length || !st.lyricsVisible) return;
        const i = st.lines.findLastIndex(line => line.time <= position);
        if (i === -1 || i === st.last) return;
        // // Throttle Discord edits: at most one per 5s to avoid rate limits.
        // if (Date.now() - (st.lastEdit ?? 0) < 5000) return;
        st.last = i;
        st.lastEdit = Date.now();
        st.msg.edit(nowPlayingCard(guildId, player, { info: st.track }, st.requester, st.lines, position, st.lyricsVisible)).catch(() => { });
    }
};
