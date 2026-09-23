const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");
const db = require("../lib/db");

module.exports = {
    name: "autoplay",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPLayer}`));
        const arg = args[0]?.toLowerCase();
        const current = player.getData("autoplay_disabled") !== true;
        const enable = arg === "on" ? true : arg === "off" ? false : !current;
        player.setData("autoplay_disabled", !enable);
        await db.set(m.guild.id, { autoPlay: enable });
        return m.reply(reply(`### ${EMOJI.shuffle} Autoplay: ${enable ? "ON" : "OFF"}`, enable ? t.autoplayOnSub : t.autoplayOffSub));
    }
};
