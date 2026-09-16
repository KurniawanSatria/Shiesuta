const { EMOJI } = require("../lib/emoji");
const { card } = require("../lib/ui");
const cfg = require("../config.json");
const PREFIX = cfg.prefix ?? ".";
const formatUptime = (s) => { const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60); const sc = Math.floor(s % 60); return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${sc}s`].filter(Boolean).join(" "); };

module.exports = {
    name: "help",
    async run(m, args, { client, t }) {
        return m.reply(card({
            title: [
                `### ${EMOJI.music} ${t.helpTitle}`,
                `-# Uptime: ${formatUptime(process.uptime())}`,
                `-# Servers: ${client.guilds.cache.size.toLocaleString()}`,
                `-# Users: ${client.guilds.cache.reduce((total, guild) => total + guild.memberCount, 0).toLocaleString()}`
            ].join("\n"),
            thumb: client.user.displayAvatarURL(),
            separator: true,
            body: [...t.helpLines].join("\n"),
            footer: `Created with ${EMOJI.heart} by [Saturiaaa.](https://satzz.online)`
        }));
    }
};
