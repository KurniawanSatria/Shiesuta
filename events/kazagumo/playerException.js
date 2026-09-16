module.exports = {
    name: "playerException",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player, track, data) {
        global.log.error(`[${player.guildId}] Track exception: ${track?.title ?? "unknown"} — ${data?.exception?.message ?? data?.message ?? "unknown"}`);
    }
};
