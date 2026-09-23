const { EMOJI } = require("../lib/emoji");
const { reply, formatDuration } = require("../lib/ui");

module.exports = {
    name: "history",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        const prev = player.queue.previous ?? [];
        if (!prev.length) return m.reply(reply(`### ${EMOJI.list} ${t.historyTitle}`, t.historyEmpty));
        const lines = [...prev].reverse().slice(0, 15).map((tr, i) => `\`${i + 1}.\` [${tr.info.title}](${tr.info.uri ?? ""}) \`${formatDuration(tr.info.duration ?? tr.info.length)}\``);
        return m.reply(reply(`### ${EMOJI.list} ${t.historyTitle}`, lines.join("\n")));
    }
};
