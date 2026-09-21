module.exports = {
    name: "playerSocketClosed",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, payload) {
        global.log.info(`Player socket closed on ${player.guildId} ${player.guild?.name ?? ""}: ${payload?.code ?? "unknown"} — ${payload?.reason ?? "no reason"}`);
    }
};
