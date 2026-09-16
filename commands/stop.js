const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");
const { stopLyrics } = require("../lib/utils");
const state = require("../lib/state");

module.exports = {
    name: "stop",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        stopLyrics(m.guild.id);
        state.npState.get(m.guild.id)?.msg?.delete().catch(() => { });
        state.npState.delete(m.guild.id);
        player.destroy();
        return m.reply(reply(`### ${EMOJI.stop} ${t.stop}`));
    }
};
