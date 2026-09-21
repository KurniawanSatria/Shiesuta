const fs = require("fs");
const path = require("path");
const cfg = require("../config.json");
const db = require("./db");

const LANGS = {};
const langDir = path.join(__dirname, "../lang");
for (const f of fs.readdirSync(langDir).filter(f => f.endsWith(".json")))
    LANGS[f.replace(".json", "")] = require(path.join(langDir, f));

const DEFAULT_LANG = cfg.defaultLang ?? "en";
const guildLang = new Map();

const T = gid => {
    const l = LANGS[guildLang.get(gid) ?? DEFAULT_LANG] ?? LANGS[DEFAULT_LANG] ?? Object.values(LANGS)[0];
    const def = LANGS[DEFAULT_LANG] ?? LANGS.en ?? {};
    return new Proxy(l, { get: (o, k) => o[k] ?? def[k] ?? "" });
};
const setLang = (gid, lang) => guildLang.set(gid, lang);
const setLangAsync = async (gid, lang) => {
    guildLang.set(gid, lang);
    await db.set(gid, { lang });
};
const loadLang = async (gid) => {
    const doc = await db.get(gid);
    if (doc?.lang) guildLang.set(gid, doc.lang);
};
const fmt = (str, vars = {}) => String(str).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

module.exports = { LANGS, T, setLang, setLangAsync, loadLang, fmt, DEFAULT_LANG };
