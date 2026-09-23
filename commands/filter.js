const { EMOJI } = require("../lib/emoji");
const { reply } = require("../lib/ui");

const PRESETS = {
    bassboost: (fm) => fm.setEQPreset("BassboostMedium"),
    nightcore: (fm) => fm.toggleNightcore(),
    vaporwave: (fm) => fm.toggleVaporwave(),
    "8d": (fm) => fm.toggleRotation(),
    karaoke: (fm) => fm.toggleKaraoke(),
    tremolo: (fm) => fm.toggleTremolo(),
    vibrato: (fm) => fm.toggleVibrato(),
    soft: (fm) => fm.toggleLowPass(),
    clear: (fm) => fm.resetFilters()
};

module.exports = {
    name: "filter",
    async run(m, args, { player, t }) {
        if (!player) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noPlayer}`));
        const fm = player.filterManager;
        if (!fm) return m.reply(reply(`### ${EMOJI.error} Error`, "Filter unavailable"));
        const arg = args[0]?.toLowerCase();
        if (!arg) {
            const state = fm.checkFiltersState();
            const active = state && Object.keys(state).filter(k => state[k]).join(", ");
            return m.reply(reply(`### ${EMOJI.audio_wave} ${t.filter}`, `${t.filterCurrent}: ${active || t.filterNone}`));
        }
        const apply = PRESETS[arg];
        if (!apply) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.filterBad}. ${t.filterList}: ${Object.keys(PRESETS).join(", ")}`));
        try { await apply(fm); } catch (e) { return m.reply(reply(`### ${EMOJI.error} Error`, e?.message || "Filter failed")); }
        return m.reply(reply(`### ${EMOJI.audio_wave} ${t.filter}`, arg === "clear" ? t.filterCleared : `${t.filterSet}: ${arg}`));
    }
};

