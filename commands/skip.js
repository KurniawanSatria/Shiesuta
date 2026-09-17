const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "skip",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        await player.skip();
        return m.reply(reply(`### ${EMOJI.skip} ${t.skip}`));
    }
};
