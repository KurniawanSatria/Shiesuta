module.exports = {
    name: "playerMoved",
    emitter: "kazagumo",
    once: false,
    async run(ctx, player, oldVoiceId, newVoiceId) {
        global.log.debug(`[${player.guildId}] Player moved: ${oldVoiceId} -> ${newVoiceId}`);
    }
};
