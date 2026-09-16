const { card, reply, formatDuration } = require("../lib/ui");
const { EMOJI } = require("../lib/emoji");

module.exports = {
    name: "queue",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPlayer}`));
        const q = player.queue;
        const cur = q.current;
        if (q.isEmpty && !cur) return m.reply(reply(`### ${EMOJI.notes} ${t.queueTitle}`, t.queueEmpty));
        const per = 10;
        const pages = Math.max(1, Math.ceil(q.length / per));
        const page = Math.min(Math.max(parseInt(args[0]) || 1, 1), pages);
        const slice = q.slice((page - 1) * per, page * per);
        const body = [];
        if (cur) body.push(`**${t.nowPlaying}:** [${cur.title}](${cur.uri ?? ""}) \`${formatDuration(cur.length)}\``, "");
        if (slice.length) body.push(`**${t.upNext}:**`, ...slice.map((tr, i) => `\`${(page - 1) * per + i + 1}.\` [${tr.title}](${tr.uri ?? ""}) \`${formatDuration(tr.length)}\``));
        if (pages > 1) body.push("", `-# ${EMOJI.notes} ${t.page.replace("{p}", page).replace("{n}", pages)}`);
        return m.reply(card({ title: `### ${EMOJI.notes} ${t.queueTitle}`, body: body.join("\n"), thumb: cur?.thumbnail }));
    }
};