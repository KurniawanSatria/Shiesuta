const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SectionBuilder, ThumbnailBuilder, SeparatorBuilder, SeparatorSpacingSize } = require("discord.js");
const { T } = require("./i18n");
const { EMOJI } = require("./emoji");

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
    `**[${track.title}](${track.uri ?? ""})**\n` +
    `${EMOJI.user} \`${track.author ?? t.unknown}\`\n` +
    `${EMOJI.time} \`${formatDuration(track.length)}\`\n` +
    `-# ${EMOJI.heart} ${t.requestedBy} ${requester ?? t.unknown}`;

function nowPlayingCard(guildId, track, requester, lines, pos) {
    const t = T(guildId);
    const body = [trackBody(track, requester, t)];
    if (lines?.length) {
        const i = Math.max(0, lines.findLastIndex(l => l.time <= pos));
        const start = Math.max(0, i - 2);
        body.push("", ...lines.slice(start, i + 3).map((l, k) => start + k === i ? `**${EMOJI.mic} __${l.text}__**` : `-# ${l.text}`));
    }
    return card({ title: `### ${EMOJI.music} ${t.nowPlaying}`, body: body.join("\n"), thumb: track.thumbnail });
}

module.exports = { DEFAULT_THUMB, formatDuration, card, reply, trackBody, nowPlayingCard };
