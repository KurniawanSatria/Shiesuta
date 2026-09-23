const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");
const { fetchLyrics, parseLrc } = require("../lib/utils");

module.exports = {
    name: "lyrics",
    async run(m, args, { player, t }) {
        if (!player?.queue?.current) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        const track = player.queue.current;
        const data = await fetchLyrics(track);
        if (!data) return m.reply(reply(`### ${EMOJI.lyrics} Lyrics`, t.lyricsUnavailable));
        if (data.syncedLyrics) {
            const lines = parseLrc(data.syncedLyrics);
            const pos = player.position / 1000;
            const i = Math.max(0, lines.findLastIndex(l => l.time <= pos));
            const start = Math.max(0, i - 3);
            const text = lines.slice(start, i + 6).map((l, k) => start + k === i ? `**__${l.text}__**` : l.text).join("\n");
            return m.reply(reply(`### ${EMOJI.lyrics} ${track.info.title}`, text));
        }
        const plain = data.plainLyrics ?? "";
        const trimmed = plain.length > 1800 ? plain.slice(0, 1800) + "\n..." : plain;
        return m.reply(reply(`### ${EMOJI.lyrics} ${track.info.title}`, trimmed));
    }
};
