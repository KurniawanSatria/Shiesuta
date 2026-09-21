module.exports = {
    name: "trackStuck",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        global.log.error(`Track stuck on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} at position ${payload?.thresholdMs ?? "unknown"}`);
    }
};
