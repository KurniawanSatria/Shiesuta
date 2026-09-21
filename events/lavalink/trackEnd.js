module.exports = {
    name: "trackEnd",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, track, payload) {
        global.log.info(`Track ended on ${player.guildId} ${player.guild?.name ?? ""}: ${track?.info?.title ?? "unknown"} (${payload?.reason ?? "unknown"})`);
    }
};
