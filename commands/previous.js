const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "previous",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        const previous = await player.queue.shiftPrevious().catch(() => null);
        if (!previous) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPrevious));
        await player.play({ clientTrack: previous });
        return m.reply(reply(`### ${EMOJI.prev} ${t.previousOk}`, t.previousSub));
    }
};
