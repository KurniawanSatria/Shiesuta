const { T } = require("../../lib/i18n");
const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const state = require("../../lib/state");
const { purge } = require("../../lib/utils");

module.exports = {
    name: "playerSocketClosed",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, payload) {
        const code = payload?.code ?? payload?.closeCode ?? "unknown";
        global.log.info(`Player socket closed on ${player.guildId} ${player.guild?.name ?? ""}: ${code} — ${payload?.reason ?? "no reason"}`);
        // 4014 = Discord dropped the voice connection (kick / channel deleted /
        // moved). Rejoining would fight the user, so destroy instead of letting
        // autoReconnect loop. Other codes are transient and handled internally.
        if (Number(code) !== 4014) return;
        state.npState.get(player.guildId)?.msg?.delete().catch(() => { });
        state.npState.delete(player.guildId);
        await purge(player.guildId);
        await player.destroy("Voice socket closed (4014)").catch(() => { });
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const t = T(player.guildId);
        await channel.send(reply(`### ${EMOJI.so_so} ${t.voiceClosed || "Disconnected from voice, queue cleared."}`, "")).catch(() => { });
    }
};
