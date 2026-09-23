const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");
const state = require("../lib/state");

module.exports = {
    name: "247",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, t.noPlayer));
        const current = player.getData("247") === true;
        const enable = args[0]?.toLowerCase() === "on" ? true : args[0]?.toLowerCase() === "off" ? false : !current;
        player.setData("247", enable);
        if (enable) {
            state.idleTimers.delete(m.guild.id);
            const t247 = state.idleTimers.get(m.guild.id);
            if (t247) { clearTimeout(t247); state.idleTimers.delete(m.guild.id); }
        }
        return m.reply(reply(`### ${EMOJI.cd} 24/7: ${enable ? "ON" : "OFF"}`, enable ? t.tfSeven_on : t.tfSeven_off));
    }
};
