module.exports = {
    name: "playerMove",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, oldVoiceChannelId, newVoiceChannelId) {
        global.log.debug(`[${player.guildId}] Player moved: ${oldVoiceChannelId} -> ${newVoiceChannelId}`);
    }
};
