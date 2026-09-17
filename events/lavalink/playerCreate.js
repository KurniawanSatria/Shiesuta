module.exports = {
    name: "playerCreate",
    emitter: "lavalink",
    once: false,
    async run(ctx, player) {
        global.log.debug(`[${player.guildId}] Player created`);
    }
};
