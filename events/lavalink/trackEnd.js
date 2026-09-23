const state = require("../../lib/state");

module.exports = {
    name: "trackEnd",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        const guildId = player.guildId;
        const reason = payload?.reason ?? "unknown";
        global.log.info(`Track ended on ${guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} (reason: ${reason})`);
        if (reason === "replaced") return;
        const current = state.npState.get(guildId);
        const endedKey = track?.info?.identifier ?? track?.info?.uri ?? track?.info?.title;
        const currentKey = current?.track?.identifier ?? current?.track?.uri ?? current?.track?.title;
        if (!current || endedKey !== currentKey) return;
        state.npState.delete(guildId);
        const pending = state.pending.get(guildId);
        if (pending) {
            const remaining = pending.filter(msg => msg.id !== current.msg?.id);
            if (remaining.length) state.pending.set(guildId, remaining);
            else state.pending.delete(guildId);
        }
        current.msg?.delete().catch(() => { });
    }
};
