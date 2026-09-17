module.exports = {
    name: "playerDestroy",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, reason) {
        global.log.debug(`[${player.guildId}] Player Destroyed${reason ? `: ${reason}` : ""}`);
    }
};
