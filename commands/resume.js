const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "resume",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        await player.pause(false);
        return m.reply(reply(`### ${EMOJI.play} ${t.resume}`));
    }
};
