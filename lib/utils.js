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

function startIdle(client, guildId) {
    clearIdle(guildId);
    state.idleTimers.set(guildId, setTimeout(async () => {
        state.idleTimers.delete(guildId);
        const p = client.lavalink.getPlayer(guildId);
        if (!p || p.playing || p.queue.tracks.length) return;
        await purge(guildId);
        await p.destroy().catch(() => { });
    }, 60000));
}

const LRC_HEADERS = { "User-Agent": "Shiesuta" };

async function fetchLyrics(track) {
    const key = `${track.info.title}|${track.info.author}`;
    if (state.lyricsCache.has(key)) return state.lyricsCache.get(key);
    const params = new URLSearchParams({
        track_name: track.info.title ?? "",
        artist_name: track.info.author ?? "",
        duration: String(Math.round((track.info.duration ?? track.info.length ?? 0) / 1000))
    });
    let data = null;
    try {
        const res = await fetch(`https://lrclib.net/api/get?${params}`, { headers: LRC_HEADERS });
        if (res.ok) data = await res.json();
        else {
            const s = await fetch(`https://lrclib.net/api/search?${new URLSearchParams({ track_name: track.info.title ?? "", artist_name: track.info.author ?? "" })}`, { headers: LRC_HEADERS });
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

module.exports = { purge, clearIdle, startIdle, fetchLyrics, parseLrc };
