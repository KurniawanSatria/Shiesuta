const { Events, AttachmentBuilder } = require("discord.js");
const fs = require("fs");
const util = require("util");
const { clearIdle } = require("../../lib/utils");
const { reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const { T, setLang } = require("../../lib/i18n");
const cfg = require("../../config.json");
const db = require("../../lib/db");

const ALIASES = {
    p: "play", play: "play",
    s: "skip", skip: "skip", next: "skip",
    pa: "pause", pause: "pause",
    r: "resume", resume: "resume",
    st: "stop", stop: "stop", leave: "stop", dc: "stop",
    q: "queue", queue: "queue", list: "queue",
    lp: "loop", loop: "loop", repeat: "loop",
    sh: "shuffle", shuffle: "shuffle",
    v: "volume", vol: "volume", volume: "volume",
    f: "filter", filter: "filter",
    ap: "autoplay", autoplay: "autoplay",
    set: "set", lang: "set",
    h: "help", help: "help",
    seek: "seek",
    prev: "previous", previous: "previous", back: "previous",
    replay: "replay", restart: "replay",
    "247": "247",
    rm: "remove", remove: "remove",
    mv: "move", move: "move",
    ly: "lyrics", lyrics: "lyrics",
    hist: "history", history: "history",
    stats: "stats", status: "stats"
};

const compsReply = (text) => ({ flags: 32768, components: [{ type: 17, components: [{ type: 10, content: text }] }] });

module.exports = {
    name: Events.MessageCreate,
    emitter: "client",
    async run(ctx, m) {
        if (!m.guild) return;
        if (m.author.bot) return;
        const settings = await db.get(m.guild.id);
        if (settings?.lang) setLang(m.guild.id, settings.lang);
        const prefix = settings?.prefix ?? cfg.prefix ?? ".";
        if (m.author.id === cfg.ownerId && m.content.startsWith('>')) {
            const code = m.content.slice(1).trim();
            const secrets = [cfg.token, cfg.mongodb, cfg.accessToken, cfg.panel?.token, cfg.statusWebhook?.token].filter(value => typeof value === "string" && value.length > 0);
            const redact = (text) => secrets.reduce((result, secret) => result.replaceAll(secret, "[redacted]"), String(text));
            try {
                let evaled = /await/i.test(code) ? await eval(`(async()=>{${code}})()`) : await eval(code);
                if (typeof evaled !== "string") evaled = util.inspect(evaled);
                evaled = redact(evaled);
                m.reply(compsReply(`${evaled.length >= 2000 ? evaled.substring(0, 1997) + "..." : evaled}`)).catch(() => { });
            } catch (err) {
                const msg = redact(err?.stack ?? err?.message ?? err);
                m.reply(compsReply(`${msg.length >= 2000 ? msg.substring(0, 1997) + "..." : msg}`)).catch(() => { });
            }
        }
        if (!m.content.startsWith(prefix)) return;
        const [raw, ...args] = m.content.slice(prefix.length).trim().split(/\s+/);
        const cmd = ALIASES[raw?.toLowerCase()];
        if (!cmd) return;
        const command = ctx.commands.get(cmd);
        if (!command) return;
        clearIdle(m.guild.id);
        const player = ctx.lavalink.getPlayer(m.guild.id);
        const t = T(m.guild.id);
        await command.run(m, args, { ...ctx, player, t }).catch(e => {
            global.log.error(`Command ${cmd}:`, e);
            m.reply(reply(`### ${EMOJI.error} Error`, t.commandError || "Something went wrong, try again later.")).catch(() => { });
        });
        if (cfg.cleanMode) setTimeout(() => m.delete().catch(() => { }), 60000);
    }
};
