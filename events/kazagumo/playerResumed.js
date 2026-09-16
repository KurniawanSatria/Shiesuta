module.exports = {
    name: "playerResumed",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player) {
        global.log.debug(`[${player.guildId}] Player resumed`);
    }
};
