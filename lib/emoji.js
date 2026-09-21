const fs = require("fs");
const path = require("path");

const DEFAULTS = {
    artist: "🎤",
    spotify: "🎵",
    youtube: "📺",
    soundcloud: "🔊",
    autoplay: "▶️",
    bye: "👋",
    music: "🎵",
    cd: "📀",
    error: "⚠️",
    lang: "📝",
    success: "✅",
    queueadd: "",
    user: "👤",
    time: "⏱️",
    mic: "🎤",
    heart: "❤️",
    play: "▶️",
    skip: "⏭",
    shuffle: "🔀",
    loop: "🔁",
    loop1: "🔂",
    pause: "⏸",
    stop: "⏹",
    check: "✅",
    volume: "🔊",
    notes: "🎶",
    arrowL: "◀",
    arrowR: "▶"
};

const ALIAS = {
    spotify: "spotify",
    youtube: "youtube",
    soundcloud: "soundcloud",
    artist: "popular_man",
    autoplay: "autoplay",
    bye: "so_so",
    music: "audio_wave",
    lang: "abc",
    cd: "music-record",
    error: "cancel",
    success: "check-mark",
    queueadd: "plus-math",
    queue: "list",
    user: "user",
    time: "clock",
    mic: "micro",
    heart: "heart",
    play: "play",
    skip: "fast_forward",
    shuffle: "shuffle",
    loop: "repeat",
    loop1: "repeat",
    pause: "pause",
    stop: "stop",
    check: "check-mark",
    notes: "list",
    arrowL: "rewind",
    arrowR: "fast_forward",
    volume: "voice"
};

const EMOJI = { ...DEFAULTS };
const sanitize = n => n.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 32);
const API = "https://discord.com/api/v9";
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp" };

const loadEmojis = async client => {
    const dir = path.join(__dirname, "../emoji");
    const token = client.token;
    const appId = client.user?.id;
    if (!token || !appId || !fs.existsSync(dir)) return global.log.info(`Emoji loader skipped: token=${!!token} app=${appId} dir=${fs.existsSync(dir)}`);
    const headers = { authorization: `Bot ${token}`, "content-type": "application/json" };
    let existing = [];
    try {
        const res = await fetch(`${API}/applications/${appId}/emojis`, { headers });
        if (res.ok) existing = (await res.json()).items ?? [];
        else global.log.error(`Emoji list failed: ${res.status}`, await res.text());
    } catch (err) {
        global.log.error("Emoji list error:", err.message);
    }
    const files = fs.readdirSync(dir).filter(f => MIME[path.extname(f).toLowerCase()]);
    global.log.info(`Emoji loader: ${existing.length} existing, ${files.length} files`);
    const have = new Set(existing.map(e => e.name));
    for (const file of files) {
        const name = sanitize(path.parse(file).name);
        if (have.has(name)) continue;
        const image = `data:${MIME[path.extname(file).toLowerCase()]};base64,${fs.readFileSync(path.join(dir, file)).toString("base64")}`;
        try {
            const res = await fetch(`${API}/applications/${appId}/emojis`, {
                method: "POST",
                headers,
                body: JSON.stringify({ name, image })
            });
            if (!res.ok) global.log.error(`Emoji failed: ${file}`, await res.text());
            else global.log.info(`Emoji uploaded: ${name}`);
        } catch (err) {
            global.log.error(`Emoji failed: ${file}`, err.message);
        }
    }
    try {
        const res = await fetch(`${API}/applications/${appId}/emojis`, { headers });
        if (res.ok) existing = (await res.json()).items ?? [];
    } catch { }
    for (const e of existing)
        if (e.name) EMOJI[e.name] = e.animated ? `<a:${e.name}:${e.id}>` : `<:${e.name}:${e.id}>`;
    for (const [key, file] of Object.entries(ALIAS)) {
        const tag = EMOJI[sanitize(file)];
        if (tag) EMOJI[key] = tag;
    }
};

module.exports = { EMOJI, loadEmojis };
