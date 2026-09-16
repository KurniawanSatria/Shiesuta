const { LANGS, setLang, T } = require("../lib/i18n");
const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

module.exports = {
    name: "set",
    async run(m, args, { t }) {
        const lang = args[1]?.toLowerCase();
        if (args[0]?.toLowerCase() !== "lang" || !LANGS[lang]) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.setLangBad}`));
        setLang(m.guild.id, lang);
        return m.reply(reply(`### ${EMOJI.check} Language`, T(m.guild.id).setLangOk));
    }
};
