const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");
const state = require("../lib/state");

module.exports = {
    name: "resume",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        player.pause(false);
        const ps = state.posState.get(m.guild.id);
        if (ps) ps.at = Date.now();
        return m.reply(reply(`### ${EMOJI.play} ${t.resume}`));
    }
};
