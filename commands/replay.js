const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "replay",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        if (!player.queue.current) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        await player.seek(0);
        return m.reply(reply(`### ${EMOJI.repeat} ${t.replayOk}`, t.replaySub));
    }
};
