const { card, trackBody, reply } = require("../lib/ui");
const { EMOJI } = require("../lib/emoji");
const state = require("../lib/state");
const db = require("../lib/db");
const cfg = require("../config.json");

const URL_RE = /^https?:\/\//i;

module.exports = {
    name: "play",
    async run(m, args, { lavalink, t }) {
        const channel = m.member.voice.channel;
        if (!channel) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noVoice}`));
        const query = args.join(" ");
        if (!query) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noQuery}`));
        // Fail fast when every Lavalink node is down instead of throwing later.
        const usable = [...lavalink.nodeManager.nodes.values()].some(n => n.connected);
        if (!usable) return m.reply(reply(`### ${EMOJI.error} Error`, t.noNodes || "Music server is offline, try again later."));
        let p = lavalink.getPlayer(m.guild.id);
        try {
            if (!p) {
                const settings = await db.get(m.guild.id);
                p = await lavalink.createPlayer({
                    guildId: m.guild.id,
                    voiceChannelId: channel.id,
                    textChannelId: m.channel.id,
                    selfDeaf: true,
                    volume: settings?.volume ?? 80
                });
                if (settings?.autoPlay === false) p.setData("autoplay_disabled", true);
            }
            if (!p.connected) await p.connect();
            else if (p.voiceChannelId !== channel.id) await p.changeVoiceState({ voiceChannelId: channel.id });
            p.textChannelId = m.channel.id;
            // URLs are resolved directly by Lavalink; plain text uses the
            // configured default search platform (ytmsearch unless configured).
            const defaultPlatform = cfg.searchPlatform ?? cfg.searchPlatfor ?? lavalink.options.playerOptions?.defaultSearchPlatform ?? "ytmsearch";
            const searchQuery = URL_RE.test(query) ? { query } : { query, source: defaultPlatform };
            const result = await p.search(searchQuery, m.author).catch(() => null);
            if (!result || result.loadType === "error" || result.loadType === "empty" || !result.tracks?.length) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noResults}`));
            // Skip broken tracks (no/short duration) per lavalink-client tipps docs.
            const valid = result.tracks.filter(tr => lavalink.utils.isNotBrokenTrack(tr));
            if (!valid.length) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noResults}`));
            const isPlaylist = result.loadType === "playlist";
            const track = valid[0];
            if (isPlaylist) await p.queue.add(valid);
            else await p.queue.add(track);
            const info = track.info;
            const msg = await m.reply(card({ title: `### ${EMOJI.queueadd} ${isPlaylist ? t.playlistQueued : t.queued}`, body: isPlaylist ? `**${result.playlist?.title}**\n-# ${EMOJI.queueadd} ${valid.length} ${t.tracks}  •  ${EMOJI.user} ${m.author.toString()}` : trackBody(track, m.author.toString(), t), thumb: info.artworkUrl }));
            const list = state.pending.get(m.guild.id) ?? [];
            list.push(msg);
            state.pending.set(m.guild.id, list);
            if (!p.playing) await p.play();
            return;
        } catch (e) {
            global.log.error(`Play [${m.guild.id}]: ${e?.message ?? e}`);
            // Don't leave a half-created, silent player behind on failure.
            if (p && !p.playing && !p.queue?.current) await p.destroy().catch(() => { });
            return m.reply(reply(`### ${EMOJI.error} Error`, t.playFailed || "Failed to play, try again later.")).catch(() => { });
        }
    }
};
