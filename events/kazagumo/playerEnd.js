module.exports = {
    name: "playerEnd",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player, track) {
        global.log.debug(`[${player.guildId}] Track ended: ${track?.title ?? "unknown"}`);
    }
};
