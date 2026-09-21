module.exports = {
    name: "trackError",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        global.log.error(`Track error on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} — ${payload?.exception?.message ?? payload?.message ?? "unknown"}`);
    }
};
