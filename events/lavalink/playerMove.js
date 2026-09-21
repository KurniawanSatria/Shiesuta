module.exports = {
    name: "playerMove",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, oldVoiceChannelId, newVoiceChannelId) {
        global.log.info(`Player moved on ${player.guildId} ${player.guild?.name ?? ""}: ${oldVoiceChannelId} -> ${newVoiceChannelId}`);
    }
};
