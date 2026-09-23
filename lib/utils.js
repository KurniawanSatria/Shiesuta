const state = require("./state");
const cfg = require("../config.json");

async function sendStatus(client, content) {
    if (!cfg.statusChannelId || !client?.isReady?.()) return;
    const ch = client.channels.cache.get(cfg.statusChannelId) ?? await client.channels.fetch(cfg.statusChannelId).catch(() => null);
    if (ch?.isTextBased?.()) ch.send({ content, allowedMentions: { parse: [] } }).catch(() => {});
}

async function purge(guildId) {
    const msgs = state.pending.get(guildId);
    if (!msgs) return;
    state.pending.delete(guildId);
    await Promise.allSettled(msgs.map(m => m.delete().catch(() => { })));
}

function clearIdle(guildId) {
    const t = state.idleTimers.get(guildId);
    if (!t) return;
    clearTimeout(t);
    state.idleTimers.delete(guildId);
}

function startIdle(client, guildId) {
    clearIdle(guildId);
    const p = client?.lavalink?.getPlayer?.(guildId) ?? client?.getPlayer?.(guildId);
    if (p?.getData?.("247") === true) return;
    state.idleTimers.set(guildId, setTimeout(async () => {
        state.idleTimers.delete(guildId);
        const player = client?.lavalink?.getPlayer?.(guildId) ?? client?.getPlayer?.(guildId);
        if (!player || player.playing || player.queue.tracks.length) return;
        await purge(guildId);
        await player.destroy().catch(() => { });
    }, 60000));
}

const LRC_HEADERS = { "User-Agent": "Shiesuta" };
const normalize = value => String(value ?? "").toLowerCase().replace(/[&/(),.'"`]/g, " ").replace(/\s+/g, " ").trim();
const artistMatches = (expected, actual) => {
    const a = normalize(expected);
    const b = normalize(actual);
    return Boolean(a && b && (a === b || a.includes(b) || b.includes(a)));
};

async function fetchLyrics(track) {
    const key = `${track.info.title}|${track.info.author}`;
    if (state.lyricsCache.has(key)) return state.lyricsCache.get(key);
    let data = null;
    try {
        const duration = (track.info.duration ?? track.info.length ?? 0) / 1000;
        const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(track.info.title ?? "")}`, { headers: LRC_HEADERS, signal: AbortSignal.timeout(10000) });
        if (res.ok) {
            const results = await res.json();
            data = (Array.isArray(results) ? results : [])
                .filter(item => artistMatches(track.info.author, item.artistName))
                .filter(item => Number.isFinite(item.duration) && Math.abs(item.duration - duration) <= 5)
                .sort((a, b) => Number(Boolean(b.syncedLyrics)) - Number(Boolean(a.syncedLyrics)))[0] ?? null;
        }
    } catch { data = null; }
    state.lyricsCache.set(key, data);
    return data;
}

const parseLrc = lrc => lrc.split("\n").map(line => {
    const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    return m ? { time: +m[1] * 60 + +m[2], text: m[3].trim() } : null;
}).filter(l => l && l.text);

module.exports = { purge, clearIdle, startIdle, fetchLyrics, parseLrc, sendStatus };
