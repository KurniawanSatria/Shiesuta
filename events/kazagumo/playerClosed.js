module.exports = {
    name: "playerClosed",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player, data) {
        global.log.debug(`[${player.guildId}] Player closed: ${data?.reason ?? "no reason"}`);
    }
};
