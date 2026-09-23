const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

const parseTime = (str) => {
    const parts = str.split(":").map(Number);
    if (parts.some(isNaN)) return null;
    if (parts.length === 3) return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
    if (parts.length === 2) return (parts[0] * 60 + parts[1]) * 1000;
    return parts[0] * 1000;
};

module.exports = {
    name: "seek",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        if (!args[0]) return m.reply(reply(`### ${EMOJI.error} Error`, t.seekBad));
        const ms = parseTime(args[0]);
        if (ms === null || ms < 0) return m.reply(reply(`### ${EMOJI.error} Error`, t.seekBad));
        const dur = player.queue.current?.info?.duration ?? 0;
        if (dur && ms > dur) return m.reply(reply(`### ${EMOJI.error} Error`, t.seekBad));
        await player.seek(ms);
        return m.reply(reply(`### ${EMOJI.duration} ${t.seekOk}`, t.seekSub.replace("{pos}", args[0])));
    }
};
