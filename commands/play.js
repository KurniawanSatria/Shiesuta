const { card, trackBody, reply } = require("../lib/ui");
const { EMOJI } = require("../lib/emoji");
const state = require("../lib/state");
const db = require("../lib/db");
const cfg = require("../config.json");

const URL_RE = /^https?:\/\//i;
const hasValid = (lavalink, result) => Boolean(result && result.loadType !== "error" && (result.tracks ?? []).some(tr => lavalink.utils.isNotBrokenTrack(tr)));

const searchWithFailover = async (lavalink, player, searchQuery, author) => {
    const result = await player.search(searchQuery, author).catch(() => null);
    if (hasValid(lavalink, result)) return result;
    const nodes = [...lavalink.nodeManager.nodes.values()].filter(n => n.connected && n.id !== player.node?.id)
        .sort((a, b) => (a.stats?.playingPlayers ?? 0) - (b.stats?.playingPlayers ?? 0));
    for (const node of nodes) {
        const candidate = await node.search(searchQuery, author).catch(() => null);
        if (hasValid(lavalink, candidate)) {
            global.log.warn(`Search failover: ${player.guildId} got results from node ${node.id} (player node ${player.node?.id} returned ${result?.loadType ?? "error"})`);
            return candidate;
        }
    }
    return result;
};

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
        let createdPlayer = false;
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
                createdPlayer = true;
                if (settings?.autoPlay === false) p.setData("autoplay_disabled", true);
            }
            if (!p.connected) await p.connect();
            else if (p.voiceChannelId !== channel.id) await p.changeVoiceState({ voiceChannelId: channel.id });
            p.textChannelId = m.channel.id;
            // URLs are resolved directly by Lavalink; plain text uses the
            // configured default search platform (ytmsearch unless configured).
            const defaultPlatform = cfg.searchPlatform ?? cfg.searchPlatfor ?? lavalink.options.playerOptions?.defaultSearchPlatform ?? "ytmsearch";
            const searchQuery = URL_RE.test(query) ? { query } : { query, source: defaultPlatform };
            const result = await searchWithFailover(lavalink, p, searchQuery, m.author);
            const valid = (result?.tracks ?? []).filter(tr => lavalink.utils.isNotBrokenTrack(tr));
            if (!valid.length) {
                if (createdPlayer) await p.destroy().catch(() => { });
                return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noResults}`));
            }
            const isPlaylist = result.loadType === "playlist";
            const track = valid[0];
            if (isPlaylist) await p.queue.add(valid);
            else await p.queue.add(track);
            const info = track.info;
            const msg = await m.reply(card({ title: `### ${isPlaylist ? EMOJI.playlist : EMOJI.queue_add} ${isPlaylist ? t.playlistQueued : t.queued}`, body: isPlaylist ? `**${result.playlist?.title}**\n-# ${EMOJI.queue_add} ${valid.length} ${t.tracks}  •  ${EMOJI.user} ${m.author.toString()}` : trackBody(track, m.author.toString(), t), thumb: info.artworkUrl }));
            const list = state.pending.get(m.guild.id) ?? [];
            list.push(msg);
            state.pending.set(m.guild.id, list);
            if (!p.playing) await p.play();
            return;
        } catch (e) {
            global.log.error(`Play [${m.guild.id}]: ${e?.message ?? e}`);
            if (createdPlayer && p && !p.playing && !p.queue?.current) await p.destroy().catch(() => { });
            return m.reply(reply(`### ${EMOJI.error} Error`, t.playFailed || "Failed to play, try again later.")).catch(() => { });
        }
    }
};
