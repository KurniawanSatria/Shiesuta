const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");
const db = require("../lib/db");

module.exports = {
    name: "volume",
    async run(m, args, { player, t }) {
        const settings = await db.get(m.guild.id);
        const current = player ? player.volume : (settings?.volume ?? 80);
        if (!args.length) return m.reply(reply(`### ${EMOJI.volume_medium} Volume`, t.volCurrent.replace("{vol}", current)));
        const val = parseInt(args[0], 10);
        if (isNaN(val) || val < 0 || val > 100) return m.reply(reply(`### ${EMOJI.error} Error`, t.volBad));
        if (player) await player.setVolume(val);
        await db.set(m.guild.id, { volume: val });
        return m.reply(reply(`### ${EMOJI.volume_medium} Volume`, t.volSet.replace("{vol}", val)));
    }
};
