const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "shuffle",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPlayer}`));
        if (player.queue.tracks.length < 2) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.shuffleNeed}`));
        await player.queue.shuffle();
        return m.reply(reply(`### ${EMOJI.shuffle} ${t.shuffle}`, `${t.shuffleSub}`));
    }
};
