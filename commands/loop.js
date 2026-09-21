const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

const CYCLE = { off: "track", track: "queue", queue: "off" };

module.exports = {
    name: "loop",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPlayer}`));
        const MODES = {
            track: ["track", "loopTrackSub", EMOJI.repeat],
            queue: ["queue", "loopQueueSub", EMOJI.repeat],
            off: ["off", "loopOffSub", EMOJI.success]
        };
        const arg = args[0]?.toLowerCase();
        const key = MODES[arg] ? arg : CYCLE[player.repeatMode ?? "off"];
        const [mode, sub, icon] = MODES[key];
        await player.setRepeatMode(mode);
        return m.reply(reply(`### ${icon} ${t.loop}: ${key[0].toUpperCase()}${key.slice(1)}`));
    }
};
