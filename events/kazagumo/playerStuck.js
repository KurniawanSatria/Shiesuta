module.exports = {
    name: "playerStuck",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player, data) {
       global.log.debug(`Player Stuck Event: ${player.guildId} at position ${data.state.position}`);
    }
};