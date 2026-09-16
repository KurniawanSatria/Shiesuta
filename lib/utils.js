const state = require("./state");

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

function stopLyrics(guildId) {
    const t = state.lyricTimers.get(guildId);
    if (!t) return;
    clearInterval(t);
    state.lyricTimers.delete(guildId);
}

function startIdle(kazagumo, guildId) {
    clearIdle(guildId);
    state.idleTimers.set(guildId, setTimeout(async () => {
        state.idleTimers.delete(guildId);
        const p = kazagumo.players.get(guildId);
        if (!p || p.playing || p.queue.size) return;
        await purge(guildId);
        p.destroy();
    }, 60000));
}

function getPos(p) {
    const ps = state.posState.get(p?.guildId);
    if (!ps) return 0;
    if (p?.paused) return ps.pos;
    return ps.pos + Math.max(0, Date.now() - ps.at);
}

const LRC_HEADERS = { "User-Agent": "SaturiaMusicBot v1.0.0 (https://github.com/saturia)" };

async function fetchLyrics(track) {
    const key = `${track.title}|${track.author}`;
    if (state.lyricsCache.has(key)) return state.lyricsCache.get(key);
    const params = new URLSearchParams({
        track_name: track.title ?? "",
        artist_name: track.author ?? "",
        duration: String(Math.round((track.length ?? 0) / 1000))
    });
    let data = null;
    try {
        const res = await fetch(`https://lrclib.net/api/get?${params}`, { headers: LRC_HEADERS });
        if (res.ok) data = await res.json();
        else {
            const s = await fetch(`https://lrclib.net/api/search?${new URLSearchParams({ track_name: track.title ?? "", artist_name: track.author ?? "" })}`, { headers: LRC_HEADERS });
            if (s.ok) data = (await s.json())?.[0] ?? null;
        }
    } catch { data = null; }
    state.lyricsCache.set(key, data);
    return data;
}

const parseLrc = lrc => lrc.split("\n").map(line => {
    const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    return m ? { time: +m[1] * 60 + +m[2], text: m[3].trim() } : null;
}).filter(l => l && l.text);

module.exports = { purge, clearIdle, stopLyrics, startIdle, fetchLyrics, parseLrc, getPos };
