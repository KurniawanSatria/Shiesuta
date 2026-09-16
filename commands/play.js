const { card, trackBody, reply } = require("../lib/ui");
const { purge } = require("../lib/utils");
const { EMOJI } = require("../lib/emoji");
const state = require("../lib/state");

module.exports = {
    name: "play",
    async run(m, args, { kazagumo, t }) {
        const channel = m.member.voice.channel;
        if (!channel) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noVoice}`));
        const query = args.join(" ");
        if (!query) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noQuery}`));
        const p = await kazagumo.createPlayer({ guildId: m.guild.id, textId: m.channel.id, voiceId: channel.id, volume: 40 });
        const result = await kazagumo.search(query, { requester: m.author });
        if (!result.tracks.length) return m.reply(reply(`### ${EMOJI.error} Error`, `${t.noResults}`));
        const isPlaylist = result.type === "PLAYLIST";
        const track = result.tracks[0];
        if (isPlaylist) p.queue.add(result.tracks);
        else p.queue.add(track);
        const msg = await m.reply(card({ title: `### ${EMOJI.queueadd} ${isPlaylist ? t.playlistQueued : t.queued}`, body: isPlaylist ? `**${result.playlistName}**\n-# ${EMOJI.note} ${result.tracks.length} ${t.tracks}  •  ${EMOJI.user} ${m.author.toString()}` : trackBody(track, m.author.toString(), t), thumb: track.thumbnail }));
        const list = state.pending.get(m.guild.id) ?? [];
        list.push(msg);
        state.pending.set(m.guild.id, list);
        if (!p.playing && !p.paused) return p.play();
        return;
    }
};
