const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize, AttachmentBuilder } = require("discord.js");
const { T } = require("./i18n");
const { EMOJI } = require("./emoji");
const fs = require("fs");
const DEFAULT_THUMB = "https://cdn.discordapp.com/embed/avatars/0.png";
const buttonEmoji = value => {
    const match = String(value).match(/^<(a?):([^:]+):(\d+)>$/);
    return match ? { animated: Boolean(match[1]), name: match[2], id: match[3] } : { name: value };
};

const formatDuration = (ms) => {
    if (!ms || ms < 0) return "0:00";
    const total = Math.floor(ms / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
};

function card({ title, body, thumb, color = null, separator = false, footer = null }) {
    const container = new ContainerBuilder().setAccentColor(color);
    const section = new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(title))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(thumb ?? DEFAULT_THUMB));
    if (separator) {
        container.addSectionComponents(section)
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(body));
    } else {
        section.addTextDisplayComponents(new TextDisplayBuilder().setContent(body));
        container.addSectionComponents(section);
    }
    if (footer) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# ${footer}`));
    return { flags: 36864, allowedMentions: { parse: [] }, components: [container] };
}


function reply(title, body = "") {
    const container = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(title));
    if (body) container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)).addTextDisplayComponents(new TextDisplayBuilder().setContent(body));
    return { flags: 36864, allowedMentions: { parse: [] }, components: [container] };
}

const trackBody = (track, requester, t) =>
    `**${track.info.title}**\n` +
    `${EMOJI.artist} ${track.info.author ?? t.unknown}\n` +
    `${EMOJI.duration} ${formatDuration(track.info.duration ?? track.info.length)}\n` +
    `-# ${EMOJI.user} ${t.requestedBy} ${requester ?? t.unknown}`;

function nowPlayingCard(guildId, player, track, requester, lines, pos, lyricsVisible = false) {
    const t = T(guildId);
    const info = track.info ?? track;
    const comps = [
        {
            type: 9,
            components: [{
                type: 10,
                content: `**${info.title}**\n${EMOJI.artist} ${info.author ?? t.unknown}\n${EMOJI.duration} ${formatDuration(Math.max(0, pos ?? 0) * 1000)} / ${formatDuration(info.duration ?? info.length)}\n${EMOJI.volume_medium} ${player.volume ?? 100}%\n`
            }],
            accessory: {
                type: 11,
                media: { url: info.artworkUrl ?? DEFAULT_THUMB }
            }
        },
        ...(!lyricsVisible ? [{ type: 14 }] : [])
    ];
    if (lines?.length && lyricsVisible) {
        const i = Math.max(0, lines.findLastIndex(l => l.time <= pos));
        const start = Math.max(0, i - 2);
        const lyrics = lines.slice(start, i + 3).map((l, k) => start + k === i ? `**__${l.text}__**` : `-# ${l.text}`);
        comps.push(
            { type: 14 },
            { type: 10, content: `### ${EMOJI.lyrics} Lyrics` },
            { type: 10, content: lyrics.join("\n") }
        );
    }
    comps.push({ type: 10, content: `-# **${info.sourceName === "spotify" ? EMOJI.spotify + " Spotify" : info.sourceName === "soundcloud" ? EMOJI.soundcloud + " SoundCloud" : info.sourceName === "youtube" ? EMOJI.youtube + " YouTube" : EMOJI.audio_wave}**  • ${EMOJI.user} ${t.requestedBy} **${requester ?? t.unknown}**\n` });
    comps.push(
        { type: 14 },
        {
            type: 1, components: [
                { type: 2, custom_id: "np_stop", emoji: buttonEmoji(EMOJI.stop), style: 4 },
                { type: 2, custom_id: "np_previous", emoji: buttonEmoji(EMOJI.prev), style: 2, disabled: !player.queue?.previous?.length },
                { type: 2, custom_id: "np_pause", emoji: buttonEmoji(player.paused ? EMOJI.play : EMOJI.pause), style: 2 },
                { type: 2, custom_id: "np_skip", emoji: buttonEmoji(EMOJI.skip), style: 2, disabled: !player.queue?.tracks?.length && player.getData?.("autoplay_disabled") === true },
                ...(lines?.length ? [{ type: 2, custom_id: "lyrics_toggle", emoji: buttonEmoji(lyricsVisible ? EMOJI.lyrics_disabled : EMOJI.lyrics), style: 2, disabled: lyricsVisible }] : [])
            ]
        });
    return { flags: 36864, allowedMentions: { parse: [] }, components: [{ type: 17, components: comps }] };
}

module.exports = { DEFAULT_THUMB, formatDuration, card, reply, trackBody, nowPlayingCard };
