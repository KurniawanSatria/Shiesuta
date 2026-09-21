module.exports = {
    name: "playerDisconnect",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, voiceChannelId) {
        global.log.info(`Player disconnected on ${player.guildId} ${player.guild?.name ?? ""} from voice channel ${voiceChannelId ?? "unknown"}`);
    }
};
