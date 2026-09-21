const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize, AttachmentBuilder } = require("discord.js");
const { T } = require("./i18n");
const { EMOJI } = require("./emoji");
const fs = require("fs");
const DEFAULT_THUMB = "https://cdn.discordapp.com/embed/avatars/0.png";

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
    return { flags: MessageFlags.IsComponentsV2, components: [container] };
}


function reply(title, body = "") {
    const container = new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(title));
    if (body) container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)).addTextDisplayComponents(new TextDisplayBuilder().setContent(body));
    return { flags: MessageFlags.IsComponentsV2, components: [container] };
}

const trackBody = (track, requester, t) =>
    `**${track.info.title}**\n` +
    `${EMOJI.artist} ${track.info.author ?? t.unknown}\n` +
    `${EMOJI.time} ${formatDuration(track.info.duration ?? track.info.length)}\n` +
    `-# ${EMOJI.user} ${t.requestedBy} ${requester ?? t.unknown}`;

function nowPlayingCard(guildId, track, requester, lines, pos) {
    const t = T(guildId);
    const info = track.info ?? track;
    const thumb = new AttachmentBuilder(fs.readFileSync('assets/banner.png'), { type: "image/png", name: 'banner.png' });
    const comps = [
        {
            type: 12,
            items: [
                {
                    media: {
                        url: "attachment://banner.png"
                    }
                }
            ]
        },
        {
            type: 9,
            components: [{
                type: 10,
                content: `-# **${info.sourceName === "spotify" ? EMOJI.spotify + " Spotify" : info.sourceName === "soundcloud" ? EMOJI.soundcloud + " SoundCloud" : info.sourceName === "youtube" ? EMOJI.youtube + " YouTube" : EMOJI.music}**\n**${info.title}**\n${EMOJI.artist} ${info.author ?? t.unknown}\n${EMOJI.time} ${formatDuration(info.duration ?? info.length)}\n\n\n\n`
            }],
            accessory: {
                type: 11,
                media: { url: info.artworkUrl ?? DEFAULT_THUMB }
            }
        },
        { type: 14 }
    ];
    if (lines?.length) {
        const i = Math.max(0, lines.findLastIndex(l => l.time <= pos));
        const start = Math.max(0, i - 2);
        const lyrics = lines.slice(start, i + 3).map((l, k) => start + k === i ? `**__${l.text}__**` : `-# ${l.text}`);
        comps.push({ type: 10, content: `### ${EMOJI.mic} Lyrics\n${lyrics.join("\n")}` }, { type: 14 });
    }
    comps.push({ type: 10, content: `-# ${EMOJI.user} ${t.requestedBy} ${requester ?? t.unknown}` });
    return { flags: 32768, files: [thumb], components: [{ type: 17, components: comps }] };
}

module.exports = { DEFAULT_THUMB, formatDuration, card, reply, trackBody, nowPlayingCard };
