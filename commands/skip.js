const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "skip",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPlayer}`));
        if (!player.queue.current) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPlayer}`));
        const to = args[0] ? Number(args[0]) : 0;
        if (to > player.queue.tracks.length) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noResults}`));
        await player.skip(to || 0, false);
        return m.reply(reply(`### ${EMOJI.skip} ${t.skip}`));
    }
};
