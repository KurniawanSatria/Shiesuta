const GuildSettings = require("./models/GuildSettings");

const cache = new Map();

const fallback = (guildId) => ({ guildId, autoPlay: true, volume: 80, __fallback: true });

const get = async (guildId) => {
    const cached = cache.get(guildId);
    if (cached && !cached.__fallback) return cached;
    try {
        const doc = await GuildSettings.findOneAndUpdate(
            { guildId },
            { $setOnInsert: { guildId } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        cache.set(guildId, doc);
        return doc;
    } catch (e) {
        global.log?.warn?.(`DB unavailable, fallback settings for ${guildId}: ${e.message}`);
        const fb = { ...(cached ?? {}), ...fallback(guildId) };
        cache.set(guildId, fb);
        return fb;
    }
};

const set = async (guildId, data) => {
    try {
        const doc = await GuildSettings.findOneAndUpdate(
            { guildId },
            { $set: data },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        cache.set(guildId, doc);
        return doc;
    } catch (e) {
        global.log?.warn?.(`DB unavailable, caching settings for ${guildId} in memory: ${e.message}`);
        const merged = { ...(cache.get(guildId) ?? fallback(guildId)), ...data };
        cache.set(guildId, merged);
        return merged;
    }
};

const setCache = (guildId, doc) => cache.set(guildId, doc);
const invalidate = (guildId) => cache.delete(guildId);

module.exports = { get, set, setCache, invalidate };
