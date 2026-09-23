// Autoplay via Lavalink-native recommendations (no external tokens).
// Previous version used a Discord user token + Spotify recommendations API
// (shut down by Spotify, and user tokens violate Discord ToS) — removed.

async function searchWithFailover(player, query, requester, gid) {
    const lavalink = player.LavalinkManager;
    const hasValidTracks = result => (result?.tracks ?? []).some(track => lavalink.utils.isNotBrokenTrack(track));
    const res = await player.search(query, requester).catch(e => {
        global.log.warn(`[${gid}] autoplay: search failed — ${e?.message ?? e}`);
        return null;
    });
    if (hasValidTracks(res)) return res;
    const nodes = [...lavalink.nodeManager.nodes.values()].filter(n => n.connected && n.id !== player.node?.id)
        .sort((a, b) => (a.stats?.playingPlayers ?? 0) - (b.stats?.playingPlayers ?? 0));
    for (const node of nodes) {
        const candidate = await node.search(query, requester).catch(() => null);
        if (hasValidTracks(candidate)) {
            global.log.warn(`[${gid}] autoplay: got results from node ${node.id} (player node ${player.node?.id} failed)`);
            return candidate;
        }
    }
    return res;
}

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
        res = await searchWithFailover(player, {
            query: `https://www.youtube.com/watch?v=${info.identifier}&list=RD${info.identifier}`
        }, requester, gid);
    } else {
        res = await searchWithFailover(player, {
            query: `${info.author ?? ""} - ${info.title}`.trim(),
            source
        }, requester, gid);
    }

    if (!res?.tracks?.length) {
        res = await searchWithFailover(player, { query: `${info.title} ${info.author ?? ""}`.trim(), source }, requester, gid);
    }
    const playedIds = new Set(player.queue.previous.map(v => v.info?.identifier).filter(Boolean));
    playedIds.add(info.identifier);
    const seen = new Set();
    const pick = (res?.tracks ?? []).find(v => {
        if (!v?.info || !player.LavalinkManager.utils.isNotBrokenTrack(v)) return false;
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
