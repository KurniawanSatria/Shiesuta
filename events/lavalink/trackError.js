module.exports = {
    name: "trackError",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        global.log.error(`[${player.guildId}] Track exception: ${track?.info?.title ?? "unknown"} — ${payload?.exception?.message ?? payload?.message ?? "unknown"}`);
    }
};
