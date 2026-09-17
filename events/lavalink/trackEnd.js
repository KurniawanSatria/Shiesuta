module.exports = {
    name: "trackEnd",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        global.log.debug(`[${player.guildId}] Track ended: ${track?.info?.title ?? "unknown"} (${payload?.reason ?? "unknown"})`);
    }
};
