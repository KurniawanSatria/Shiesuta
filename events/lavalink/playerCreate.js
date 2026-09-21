const db = require("../../lib/db");

module.exports = {
    name: "playerCreate",
    emitter: "lavalink",
    once: false,
    async run(ctx, player) {
        const settings = await db.get(player.guildId);
        if (settings?.autoPlay === false) player.setData("autoplay_disabled", true);
        if (settings?.volume !== undefined) await player.setVolume(settings.volume).catch(() => { });
        global.log.info(`Player created on ${player.guildId} ${player.guild?.name ?? ""}`);
    }
};
