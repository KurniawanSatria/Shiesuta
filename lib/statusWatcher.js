const { WebhookClient, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");
const cfg = require("../config.json");
const { EMOJI } = require("./emoji");

const wh = cfg.statusWebhook ? new WebhookClient({ id: cfg.statusWebhook.id, token: cfg.statusWebhook.token }) : null;
const statusMsgId = cfg.statusMessageId ?? null;

const formatUptime = (s) => {
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); const sc = Math.floor(s % 60);
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${sc}s`].filter(Boolean).join(" ");
};

function buildPayload(client, lavalink, nodeOverrides = {}) {
    const nodes = [...lavalink.nodeManager.nodes.values()];
    const nodeLines = nodes.map((n, i) => {
        const override = nodeOverrides[n.id];
        const online = override?.online ?? n.connected;
        const status = online ? `${EMOJI.success} Online` : `${EMOJI.error} Offline`;
        const players = n.stats?.players ?? 0;
        const cpu = n.stats?.cpu ? `${(n.stats.cpu.lavalinkLoad * 100).toFixed(1)}%` : "N/A";
        const mem = n.stats?.memory ? `${Math.round(n.stats.memory.used / 1024 / 1024)}MB` : "N/A";
        return `**Node ${i + 1}** — ${status} | Players: ${players} | CPU: ${cpu} | RAM: ${mem}`;
    });
    const body = [
        `${EMOJI.duration} Uptime: **${formatUptime(Math.floor(process.uptime()))}**`,
        `${EMOJI.user} Servers: **${client.guilds.cache.size}**`,
        `${EMOJI.cd} Active Players: **${nodes.reduce((a, n) => a + (n.stats?.players ?? 0), 0)}**`,
        "",
        ...nodeLines,
        "",
        `-# Last updated: <t:${Math.floor(Date.now() / 1000)}:R>`
    ].join("\n");

    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${EMOJI.audio_wave} Shiesuta Status`))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(body));

    return { flags: 36864, allowedMentions: { parse: [] }, components: [container] };
}

async function initStatus(client, lavalink) {
    if (!wh || !statusMsgId) return;
    await updateStatus(client, lavalink).catch(e => global.log.error(`statusWatcher init failed: ${e?.message ?? e}`));
}

async function updateStatus(client, lavalink, nodeOverrides = {}) {
    if (!wh || !statusMsgId) return;
    try {
        const payload = buildPayload(client, lavalink, nodeOverrides);
        await wh.editMessage(statusMsgId, { ...payload, username: "Shiesuta Watcher", avatarURL: client.user.displayAvatarURL() });
    } catch (e) {
        global.log.error(`statusWatcher update failed: ${e?.message ?? e}`);
    }
}

module.exports = { initStatus, updateStatus };
