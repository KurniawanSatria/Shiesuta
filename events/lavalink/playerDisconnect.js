const { T } = require("../../lib/i18n");
const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");

module.exports = {
    name: "playerDisconnect",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, voiceChannelId) {
        global.log.info(`Player disconnected on ${player.guildId} ${player.guild?.name ?? ""} from voice channel ${voiceChannelId ?? "unknown"}`);
        // This only fires when autoReconnect gave up or the queue was empty —
        // a connected-but-voiceless ghost player serves nothing, destroy it.
        if (player.connected) return;
        await player.destroy("Voice disconnected").catch(() => { });
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const t = T(player.guildId);
        await channel.send(reply(`### ${EMOJI.so_so} ${t.voiceClosed || "Disconnected from voice, queue cleared."}`, "")).catch(() => { });
    }
};
