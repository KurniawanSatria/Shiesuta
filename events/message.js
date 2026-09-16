const { Events } = require("discord.js");
const { card } = require("../lib/ui");
const { clearIdle } = require("../lib/utils");
const { T } = require("../lib/i18n");
const cfg = require("../config.json");
const PREFIX = cfg.prefix ?? ".";

const ALIASES = {
    p: "play", play: "play",
    s: "skip", skip: "skip", next: "skip",
    pa: "pause", pause: "pause",
    r: "resume", resume: "resume",
    st: "stop", stop: "stop", leave: "stop", dc: "stop",
    lp: "loop", loop: "loop", repeat: "loop",
    set: "set", lang: "set",
    h: "help", help: "help"
};

module.exports = {
    name: Events.MessageCreate,
    emitter: "client",
    async run(ctx, m) {
        if (m.author.bot || !m.content.startsWith(PREFIX)) return;
        const [raw, ...args] = m.content.slice(PREFIX.length).trim().split(/\s+/);
        const cmd = ALIASES[raw?.toLowerCase()];
        if (!cmd) return;
        const command = ctx.commands.get(cmd);
        if (!command) return;
        if (m.guild) clearIdle(m.guild.id);
        const player = ctx.kazagumo.players.get(m.guild?.id);
        const t = T(m.guild?.id);
        await command.run(m, args, { ...ctx, player, t }).catch(e => console.error(`Command ${cmd}:`, e));
    }
};
