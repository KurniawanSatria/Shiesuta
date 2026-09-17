module.exports = {
    name: "playerSocketClosed",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, payload) {
        global.log.debug(`[${player.guildId}] Player socket closed: ${payload?.code ?? "unknown"} — ${payload?.reason ?? "no reason"}`);
    }
};
