const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

const formatUptime = (s) => {
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); const sc = Math.floor(s % 60);
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${sc}s`].filter(Boolean).join(" ");
};

module.exports = {
    name: "stats",
    async run(m, args, { client, lavalink, t }) {
        const nodes = [...lavalink.nodeManager.nodes.values()];
        const nodeLines = nodes.map(n => {
            const status = n.connected ? `${EMOJI.success} Online` : `${EMOJI.error} Offline`;
            const players = n.stats?.players ?? 0;
            const cpu = n.stats?.cpu ? `${(n.stats.cpu.lavalinkLoad * 100).toFixed(1)}%` : "N/A";
            const mem = n.stats?.memory ? `${Math.round(n.stats.memory.used / 1024 / 1024)}MB` : "N/A";
            return `**${n.id ?? n.options?.id ?? "node"}** — ${status} | Players: ${players} | CPU: ${cpu} | RAM: ${mem}`;
        });
        const body = [
            `${EMOJI.duration} Uptime: **${formatUptime(Math.floor(process.uptime()))}**`,
            `${EMOJI.user} Servers: **${client.guilds.cache.size}**`,
            `${EMOJI.cd} Active Players: **${nodes.reduce((a, n) => a + (n.stats?.players ?? 0), 0)}**`,
            "",
            ...nodeLines
        ].join("\n");
        return m.reply(reply(`### ${EMOJI.audio_wave} ${t.statsTitle}`, body));
    }
};
