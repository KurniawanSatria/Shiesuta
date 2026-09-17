const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

const CYCLE = { off: "track", track: "queue", queue: "off" };

module.exports = {
    name: "loop",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        const MODES = {
            track: ["track", "loopTrackSub", EMOJI.loop1],
            queue: ["queue", "loopQueueSub", EMOJI.loop],
            off: ["off", "loopOffSub", EMOJI.check]
        };
        const arg = args[0]?.toLowerCase();
        const key = MODES[arg] ? arg : CYCLE[player.repeatMode ?? "off"];
        const [mode, sub, icon] = MODES[key];
        player.setRepeatMode(mode);
        return m.reply(reply(`### ${icon} ${t.loop}: ${key[0].toUpperCase()}${key.slice(1)}`));
    }
};
