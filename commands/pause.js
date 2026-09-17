const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "pause",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        await player.pause(true);
        return m.reply(reply(`### ${EMOJI.pause} ${t.pause}`));
    }
};
