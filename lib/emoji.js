const DEFAULTS = {
    artist: "🎤",
    spotify: "🎵",
    youtube: "📺",
    soundcloud: "🔊",
    autoplay: "▶️",
    so_so: "👋",
    audio_wave: "🎵",
    cd: "📀",
    error: "⚠️",
    lang: "📝",
    success: "✅",
    queue_add: "➕",
    queue: "📋",
    playlist: "📜",
    book: "🔖",
    lyrics_disabled: "🔇",
    user: "👤",
    duration: "⏱️",
    lyrics: "🎤",
    heart: "❤️",
    play: "▶️",
    skip: "⏭",
    shuffle: "🔀",
    repeat: "🔁",
    repeat_one: "🔂",
    pause: "⏸",
    stop: "⏹",
    volume_medium: "🔊",
    vol_down: "🔉",
    vol_up: "🔊",
    list: "🎶",
    prev: "◀",
    seek_back: "⏪",
    seek_fwd: "⏩"
};
const EMOJI = { ...DEFAULTS };

async function loadEmojis(client) {
    const token = client.token;
    const appId = client.user?.id;
    if (!token || !appId) return;
    try {
        const res = await fetch(`https://discord.com/api/v10/applications/${appId}/emojis`, { headers: { authorization: `Bot ${token}` } });
        if (!res.ok) return global.log.warn(`Emoji fetch failed: ${res.status}`);
        for (const emoji of (await res.json()).items ?? []) {
            if (!emoji.name || !emoji.id) continue;
            const name = emoji.name === "emojitdurartion" ? "duration" : emoji.name;
            EMOJI[name] = emoji.animated ? `<a:${emoji.name}:${emoji.id}>` : `<:${emoji.name}:${emoji.id}>`;
        }
    } catch (error) {
        global.log.warn(`Emoji fetch failed: ${error.message}`);
    }
}

module.exports = { EMOJI, loadEmojis };
