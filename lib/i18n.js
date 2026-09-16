const fs = require("fs");
const path = require("path");
const cfg = require("../config.json");

const LANGS = {};
const langDir = path.join(__dirname, "../lang");
for (const f of fs.readdirSync(langDir).filter(f => f.endsWith(".json")))
    LANGS[f.replace(".json", "")] = require(path.join(langDir, f));

const DEFAULT_LANG = cfg.defaultLang ?? "en";
const guildLang = new Map();

const T = gid => LANGS[guildLang.get(gid) ?? DEFAULT_LANG] ?? LANGS[DEFAULT_LANG] ?? Object.values(LANGS)[0];
const setLang = (gid, lang) => guildLang.set(gid, lang);
const fmt = (str, vars = {}) => String(str).replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");

module.exports = { LANGS, T, setLang, fmt, DEFAULT_LANG };
