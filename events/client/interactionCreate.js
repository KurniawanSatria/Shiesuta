const { Events } = require("discord.js");
const fs = require("fs");
const { AttachmentBuilder } = require("discord.js");
const state = require("../../lib/state");
const { nowPlayingCard, formatDuration, reply } = require("../../lib/ui");
const { EMOJI } = require("../../lib/emoji");
const { T } = require("../../lib/i18n");
const db = require("../../lib/db");
const cfg = require("../../config.json");

const SEEK_STEP = 10;

module.exports = {
    name: Events.InteractionCreate,
    emitter: "client",
    async run(ctx, interaction) {
        if (!interaction.isButton()) return;
        const st = state.npState.get(interaction.guildId);
        if (!st || st.msg.id !== interaction.message.id) return interaction.reply({ content: "This track is no longer active.", ephemeral: true, allowedMentions: { parse: [] } });
        const player = ctx.lavalink.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ content: "This track is no longer active.", ephemeral: true, allowedMentions: { parse: [] } });
        const id = interaction.customId;
        const t = T(interaction.guildId);

        if (id === "lyrics_toggle") {
            st.lyricsVisible = !st.lyricsVisible;
            st.last = -1;
            return interaction.update(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
        }

        if (id === "np_queue") {
            const q = player.queue;
            const upcoming = q.tracks;
            const cur = q.current;
            const per = 10;
            const slice = upcoming.slice(0, per);
            const body = [];
            if (cur) body.push(`**${t.nowPlaying}:** [${cur.info.title}](${cur.info.uri ?? ""}) \`${formatDuration(cur.info.duration ?? cur.info.length)}\``, "");
            if (slice.length) body.push(`**${t.upNext}:**`, ...slice.map((tr, i) => `\`${i + 1}.\` [${tr.info.title}](${tr.info.uri ?? ""}) \`${formatDuration(tr.info.duration ?? tr.info.length)}\``));
            if (upcoming.length > per) body.push("", `-# ${EMOJI.queue} +${upcoming.length - per} more`);
            if (!body.length) body.push(t.queueEmpty);
            return interaction.reply({ ...reply(`### ${EMOJI.queue} ${t.queueTitle}`, body.join("\n")), ephemeral: true }).catch(() => { });
        }

        if (id === "np_donate") {
            const thumb = new AttachmentBuilder(fs.readFileSync("assets/banner.png"), { type: "image/png", name: "banner.png" });
            return interaction.reply({
                flags: 64,
                allowedMentions: { parse: [] },
                files: [thumb],
                components: [{
                    type: 17,
                    components: [
                        { type: 12, items: [{ media: { url: "attachment://banner.png" } }] },
                        { type: 10, content: `### Thank you for using our service!\n\nLoving the bot?\nConsider supporting our work and the future development of the bot. Even a small donation helps a lot! ❤️\n\n**Support us:**\n- <:trakteer:1550260356729938000> **[Trakteer](https://trakteer.id/saturiaaa.)**\n- <:saweria:1550260498686156810> **[Saweria](https://saweria.co/Saturiaaa)**\n- <:sociabuzz:1550260354255163423> **[Sociabuzz](https://sociabuzz.com/saturiaaa/)**` }
                    ]
                }]
            }).catch(() => { });
        }

        await interaction.deferUpdate().catch(() => { });

        if (id === "np_skip") return player.skip(0, false).catch(() => { });
        if (id === "np_stop") return player.destroy().catch(() => { });

        if (id === "np_pause") {
            await (player.paused ? player.resume() : player.pause()).catch(() => { });
            return interaction.message.edit(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
        }

        if (id === "np_previous") {
            const previous = await player.queue.shiftPrevious().catch(() => null);
            if (!previous) return;
            return player.play({ clientTrack: previous }).catch(() => { });
        }

        if (id === "np_repeat") {
            const CYCLE = { off: "track", track: "queue", queue: "off" };
            const next = CYCLE[player.repeatMode ?? "off"];
            await player.setRepeatMode(next).catch(() => { });
            return interaction.message.edit(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
        }

        if (id === "np_shuffle") {
            if ((player.queue.tracks?.length ?? 0) >= 2) await player.queue.shuffle().catch(() => { });
            return interaction.message.edit(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
        }

        if (id === "np_autoplay") {
            const enable = player.getData("autoplay_disabled") === true;
            player.setData("autoplay_disabled", !enable);
            await db.set(interaction.guildId, { autoPlay: enable });
            return interaction.message.edit(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
        }

        if (id === "np_vol_down" || id === "np_vol_up") {
            const delta = id === "np_vol_up" ? 10 : -10;
            const newVol = Math.min(100, Math.max(0, (player.volume ?? 100) + delta));
            await player.setVolume(newVol).catch(() => { });
            await db.set(interaction.guildId, { volume: newVol });
            return interaction.message.edit(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
        }

        if (id === "np_seek_back" || id === "np_seek_fwd") {
            const delta = (id === "np_seek_fwd" ? SEEK_STEP : -SEEK_STEP) * 1000;
            const newPos = Math.min(st.track.duration ?? Infinity, Math.max(0, player.position + delta));
            await player.seek(newPos).catch(() => { });
            return interaction.message.edit(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, newPos / 1000, st.lyricsVisible)).catch(() => { });
        }
    }
};