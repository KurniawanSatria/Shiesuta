const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "move",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        const from = parseInt(args[0], 10);
        const to = parseInt(args[1], 10);
        const len = player.queue.tracks.length;
        if (isNaN(from) || isNaN(to) || from < 1 || to < 1 || from > len || to > len || from === to)
            return m.reply(reply(`### ${EMOJI.error} Error`, t.moveBad.replace("{max}", len)));
        const [track] = player.queue.tracks.splice(from - 1, 1);
        player.queue.tracks.splice(to - 1, 0, track);
        return m.reply(reply(`### ${EMOJI.queue} ${t.moveOk}`, `[${track.info.title}](${track.info.uri ?? ""}) → #${to}`));
    }
};
