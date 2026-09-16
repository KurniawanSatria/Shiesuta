module.exports = {
    name: "playerResolveError",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player, track, data) {
        global.log.warn(`[${player.guildId}] Resolve error: ${track?.title ?? "unknown"} — ${data?.message ?? data}`);
    }
};
