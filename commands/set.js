const { LANGS, setLangAsync, T } = require("../lib/i18n");
const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");
const db = require("../lib/db");

const SUBCOMMANDS = {
    async lang(m, args, t) {
        const val = args[0]?.toLowerCase();
        if (!LANGS[val]) return m.reply(reply(`### ${EMOJI.error} Error`, t.setLangBad));
        await setLangAsync(m.guild.id, val);
        return m.reply(reply(`### ${EMOJI.lang} Language`, T(m.guild.id).setLangOk));
    },
    async prefix(m, args, t) {
        const val = args[0];
        if (!val || val.length > 5) return m.reply(reply(`### ${EMOJI.error} Error`, t.setPrefixBad));
        await db.set(m.guild.id, { prefix: val });
        return m.reply(reply(`### ${EMOJI.success} Prefix`, t.setPrefixOk.replace("{prefix}", val)));
    },
    async autoplay(m, args, t, player) {
        const settings = await db.get(m.guild.id);
        const current = player ? player.getData("autoplay_disabled") !== true : (settings?.autoPlay ?? true);
        const arg = args[0]?.toLowerCase();
        const enable = arg === "on" ? true : arg === "off" ? false : !current;
        if (player) player.setData("autoplay_disabled", !enable);
        await db.set(m.guild.id, { autoPlay: enable });
        return m.reply(reply(`### ${EMOJI.autoplay} Autoplay: ${enable ? "ON" : "OFF"}`, enable ? t.autoplayOnSub : t.autoplayOffSub));
    },
    async volume(m, args, t, player) {
        const val = parseInt(args[0], 10);
        if (isNaN(val) || val < 0 || val > 100) return m.reply(reply(`### ${EMOJI.error} Error`, t.volBad));
        if (player) await player.setVolume(val);
        await db.set(m.guild.id, { volume: val });
        return m.reply(reply(`### ${EMOJI.success} Volume`, t.volSet.replace("{vol}", val)));
    }
};

module.exports = {
    name: "set",
    async run(m, args, { player, t }) {
        const sub = args[0]?.toLowerCase();
        const fn = SUBCOMMANDS[sub];
        if (!fn) return m.reply(reply(`### ${EMOJI.error} Error`, t.setUsage));
        return fn(m, args.slice(1), t, player);
    }
};
