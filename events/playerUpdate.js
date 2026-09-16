const state = require("../lib/state");
const { nowPlayingCard } = require("../lib/ui");

module.exports = {
    name: "playerUpdate",
    emitter: "kazagumo",
    async run(ctx, player, data) {
        const guildId = player.guildId;
        const position = data.state.position / 1000;
        state.posState.set(guildId, { pos: data.state.position, at: Date.now(), paused: player.paused });
        const st = state.npState.get(guildId);
        if (!st || player.paused) return;
        if (!st.lines?.length) return;
        const i = st.lines.findLastIndex(line => line.time <= position);
        if (i === -1 || i === st.last) return;
        st.last = i;
        st.msg.edit(nowPlayingCard(guildId, st.track, st.requester, st.lines, position)).catch(() => { });
    }
};