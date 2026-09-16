module.exports = {
    name: "playerCreate",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player) {
        global.log.debug(`[${player.guildId}] Player created`);
    }
};
