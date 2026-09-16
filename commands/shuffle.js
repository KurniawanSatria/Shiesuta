const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "shuffle",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        if (player.queue.size < 2) return m.reply(reply(`## ${EMOJI.error} Error`));
        player.queue.shuffle();
        return m.reply(reply(`### ${EMOJI.shuffle} ${t.shuffle}`));
    }
};
