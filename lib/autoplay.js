const cfg = require("../config.json");

async function getAccessToken() {
    const res = await fetch("https://discord.com/api/v9/users/@me/connections", {
        headers: {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9,id;q=0.8",
            "authorization": cfg.spotify?.token ?? cfg.accessToken ?? "",
            "cache-control": "no-cache",
            "pragma": "no-cache"
        },
        body: null,
        method: "GET"
    });
    if (!res.ok) throw new Error(`Discord connections HTTP ${res.status}`);
    const conns = await res.json();
    if (!Array.isArray(conns)) throw new Error("Discord connections: unexpected response");
    const spotify = conns.find(i => i.type === "spotify");
    return spotify?.access_token ?? null;
}


async function getSpotifyRecommendations(seedIds, limit = 10) {
    const accessToken = await getAccessToken();
    if (!accessToken) throw new Error("Spotify access token not found");
    const url = `https://api.spotify.com/v1/recommendations?seed_tracks=${seedIds.join(",")}&limit=${limit}&market=ID`;
    const data = await fetch(url, {
        headers: { "Authorization": `Bearer ${accessToken}`, "Accept": "application/json" }
    }).then(r => {
        if (!r.ok) throw new Error(`Spotify recommendations HTTP ${r.status}`);
        return r.json();
    });
    return (data.tracks ?? []).map(t => t.id).filter(Boolean);
}

async function autoPlayFunction(player, lastPlayedTrack) {
    const gid = player.guildId;

    if (player.getData("autoplay_disabled") === true) return global.log.debug(`[${gid}] autoplay: off, skipped`);
    if (!lastPlayedTrack?.info) return global.log.debug(`[${gid}] autoplay: no lastPlayedTrack`);

    const requester = lastPlayedTrack.requester;
    const src = lastPlayedTrack.info.sourceName;
    const info = lastPlayedTrack.info;
    let res = null;

    if (src === "spotify") {
        const seedId = info.identifier || info.uri?.match(/spotify\.com\/track\/([^/?]+)/)?.[1];
        if (seedId) {
            try {
                const recIds = await getSpotifyRecommendations([seedId], 1);
                if (!recIds.length) throw new Error("empty recommendations");
                const result = await player.search({ query: `https://open.spotify.com/track/${recIds[0]}`, source: "spotify" }, requester);
                const tracks = result?.loadType === "track" || result?.loadType === "search" ? result.tracks : [];
                if (!tracks.length) throw new Error("recommendation could not be resolved");
                res = { tracks };
            } catch (e) {
                global.log.warn(`[${gid}] autoplay: spotify rec failed — ${e?.message ?? e}`);
            }
        }
    } else if (src === "youtube" || src === "youtubemusic") {
        res = await player.search({
            query: `https://www.youtube.com/watch?v=${info.identifier}&list=RD${info.identifier}`,
            source: "youtube"
        }, requester).catch(e => {
            global.log.warn(`[${gid}] autoplay: youtube mix failed — ${e?.message ?? e}`);
            return null;
        });
    }

    if (!res?.tracks?.length) {
        res = await player.search({ query: `${info.title} ${info.author ?? ""}`.trim() }, requester).catch(e => {
            global.log.warn(`[${gid}] autoplay: fallback search failed — ${e?.message ?? e}`);
            return null;
        });
    }
    const playedIds = new Set(player.queue.previous.map(v => v.info?.identifier).filter(Boolean));
    playedIds.add(info.identifier);
    const seen = new Set();
    const picks = (res?.tracks ?? []).filter(v => {
        if (!v?.info) return false;
        if (v.info.identifier && playedIds.has(v.info.identifier)) return false;
        if (v.info.title === info.title && v.info.author === info.author) return false;
        const key = v.info.identifier ?? `${v.info.title}|${v.info.author}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, 5);

    if (!picks.length) return global.log.warn(`[${gid}] autoplay: no candidates (source=${src ?? "unknown"})`);

    await player.queue.add(picks.map(track => {
        track.pluginInfo = { ...track.pluginInfo, clientData: { ...track.pluginInfo?.clientData, fromAutoplay: true } };
        return track;
    }));
    global.log.info(`[${gid}] autoplay: added ${picks.length} tracks (source=${src}): ${picks.map(p => p.info.title).join(" | ")}`);
}

module.exports = { autoPlayFunction };
