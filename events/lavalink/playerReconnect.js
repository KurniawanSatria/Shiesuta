module.exports = {
    name: "playerReconnect",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, voiceChannelId) {
        global.log.info(`Player reconnected on ${player.guildId} ${player.guild?.name ?? ""} to voice channel ${voiceChannelId ?? "unknown"}`);
    }
};
