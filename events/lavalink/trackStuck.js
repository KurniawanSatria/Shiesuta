module.exports = {
    name: "trackStuck",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        global.log.debug(`[${player.guildId}] Track stuck: ${track?.info?.title ?? "unknown"} at position ${payload?.thresholdMs ?? "unknown"}`);
    }
};
