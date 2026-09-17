module.exports = {
    name: "playerDisconnect",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, voiceChannelId) {
        global.log.debug(`[${player.guildId}] Player disconnected from voice channel ${voiceChannelId ?? "unknown"}`);
    }
};
