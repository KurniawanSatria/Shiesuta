const { card, trackBody, reply } = require("../lib/ui");
const { purge } = require("../lib/utils");
const { EMOJI } = require("../lib/emoji");
const state = require("../lib/state");

module.exports = {
    name: "play",
    async run(m, args, { lavalink, t }) {
        const channel = m.member.voice.channel;
        if (!channel) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noVoice}`));
        const query = args.join(" ");
        if (!query) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noQuery}`));
        let p = lavalink.getPlayer(m.guild.id);
        const connected = p?.connected ?? false;
        if (!p) {
            p = await lavalink.createPlayer({
                guildId: m.guild.id,
                voiceChannelId: channel.id,
                textChannelId: m.channel.id,
                selfDeaf: true,
                volume: 40
            });
        }
        if (!p.connected) await p.connect();
        else if (p.voiceChannelId !== channel.id) await p.changeVoiceState({ voiceChannelId: channel.id });
        p.textChannelId = m.channel.id;
        const result = await p.search({ query, source: "spotify"}, m.author);
        if (!result || !result.tracks?.length) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noResults}`));
        const isPlaylist = result.loadType === "playlist";
        const track = result.tracks[0];
        if (isPlaylist) await p.queue.add(result.tracks);
        else await p.queue.add(track);
        const info = track.info;
        const msg = await m.reply(card({ title: `### ${EMOJI.queueadd} ${isPlaylist ? t.playlistQueued : t.queued}`, body: isPlaylist ? `**${result.playlist?.title}**\n-# ${EMOJI.note} ${result.tracks.length} ${t.tracks}  •  ${EMOJI.user} ${m.author.toString()}` : trackBody(track, m.author.toString(), t), thumb: info.artworkUrl }));
        const list = state.pending.get(m.guild.id) ?? [];
        list.push(msg);
        state.pending.set(m.guild.id, list);
        if (!p.playing) await p.play();
        return;
    }
};
