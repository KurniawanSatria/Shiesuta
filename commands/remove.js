const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "remove",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        const idx = parseInt(args[0], 10);
        if (isNaN(idx) || idx < 1 || idx > player.queue.tracks.length) return m.reply(reply(`### ${EMOJI.error} Error`, t.removeBad.replace("{max}", player.queue.tracks.length)));
        const removed = player.queue.tracks[idx - 1];
        player.queue.tracks.splice(idx - 1, 1);
        return m.reply(reply(`### ${EMOJI.queue} ${t.removeOk}`, `[${removed.info.title}](${removed.info.uri ?? ""})`));
    }
};
