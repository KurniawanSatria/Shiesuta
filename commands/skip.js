const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "skip",
    async run(m, args, { kazagumo, player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        player.skip();
        return m.reply(reply(`### ${EMOJI.skip} ${t.skip}`));
    }
};
