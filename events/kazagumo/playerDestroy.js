module.exports = {
    name: 'playerDestroy',
    emitter: 'kazagumo',
    once: false,
    async run(ctx, data) {
        global.log.debug(`[${data.guildId}] Player Destroyed`);
        ctx.client.activePlayers.delete(data.guildId);
    },
};
