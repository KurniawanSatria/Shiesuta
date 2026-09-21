// Autoplay via Lavalink-native recommendations (no external tokens).
// Previous version used a Discord user token + Spotify recommendations API
// (shut down by Spotify, and user tokens violate Discord ToS) — removed.

async function autoPlayFunction(player, lastPlayedTrack) {
    const gid = player.guildId;

    if (player.getData("autoplay_disabled") === true) return global.log.info(`[${gid}] autoplay: off, skipped`);
    const db = require("./db");
    const settings = await db.get(gid);
    if (settings?.autoPlay === false) {
        player.setData("autoplay_disabled", true);
        return global.log.info(`[${gid}] autoplay: off, skipped`);
    }
    if (!lastPlayedTrack?.info) return global.log.info(`[${gid}] autoplay: no lastPlayedTrack`);

    const requester = lastPlayedTrack.requester;
    const src = lastPlayedTrack.info.sourceName;
    const info = lastPlayedTrack.info;
    const source = src === "spotify" ? "spsearch" : src === "soundcloud" ? "scsearch" : src === "youtubemusic" ? "ytmsearch" : "ytsearch";
    let res = null;

    if (src === "youtube" || src === "youtubemusic") {
        // YouTube mix playlist of the last track.
        res = await player.search({
            query: `https://www.youtube.com/watch?v=${info.identifier}&list=RD${info.identifier}`
        }, requester).catch(e => {
            global.log.warn(`[${gid}] autoplay: youtube mix failed — ${e?.message ?? e}`);
            return null;
        });
    } else {
        res = await player.search({
            query: `${info.author ?? ""} - ${info.title}`.trim(),
            source
        }, requester).catch(e => {
            global.log.warn(`[${gid}] autoplay: ${source} search failed — ${e?.message ?? e}`);
            return null;
        });
    }

    if (!res?.tracks?.length) {
        res = await player.search({ query: `${info.title} ${info.author ?? ""}`.trim(), source }, requester).catch(e => {
            global.log.warn(`[${gid}] autoplay: fallback search failed — ${e?.message ?? e}`);
            return null;
        });
    }
    const playedIds = new Set(player.queue.previous.map(v => v.info?.identifier).filter(Boolean));
    playedIds.add(info.identifier);
    const seen = new Set();
    const pick = (res?.tracks ?? []).find(v => {
        if (!v?.info) return false;
        if (v.info.identifier && playedIds.has(v.info.identifier)) return false;
        if (v.info.title === info.title && v.info.author === info.author) return false;
        const key = v.info.identifier ?? `${v.info.title}|${v.info.author}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    if (!pick) return global.log.warn(`[${gid}] autoplay: no candidates (source=${src ?? "unknown"})`);

    pick.pluginInfo = { ...pick.pluginInfo, clientData: { ...pick.pluginInfo?.clientData, fromAutoplay: true } };
    await player.queue.add(pick);
    global.log.info(`[${gid}] autoplay: added 1 track (source=${src}): ${pick.info.title}`);
}

module.exports = { autoPlayFunction };
