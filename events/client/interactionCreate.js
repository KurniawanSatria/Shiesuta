const { Events } = require("discord.js");
const state = require("../../lib/state");
const { nowPlayingCard } = require("../../lib/ui");

module.exports = {
    name: Events.InteractionCreate,
    emitter: "client",
    async run(ctx, interaction) {
        if (!interaction.isButton()) return;
        const st = state.npState.get(interaction.guildId);
        if (!st || st.msg.id !== interaction.message.id) return interaction.reply({ content: "This track is no longer active.", ephemeral: true });
        const player = ctx.lavalink.getPlayer(interaction.guildId);
        if (!player) return interaction.reply({ content: "This track is no longer active.", ephemeral: true });
        if (["np_skip", "np_previous", "np_stop", "np_pause"].includes(interaction.customId)) {
            await interaction.deferUpdate().catch(() => { });
            if (interaction.customId === "np_skip") return player.skip(0, false).catch(() => { });
            if (interaction.customId === "np_stop") return player.destroy().catch(() => { });
            if (interaction.customId === "np_pause") {
                await (player.paused ? player.resume() : player.pause()).catch(() => { });
                return interaction.message.edit(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
            }
            const previous = await player.queue.shiftPrevious().catch(() => null);
            if (!previous) return;
            await player.play({ clientTrack: previous }).catch(() => { });
            return;
        }
        if (interaction.customId !== "lyrics_toggle") return;
        st.lyricsVisible = !st.lyricsVisible;
        st.last = -1;
        await interaction.update(nowPlayingCard(interaction.guildId, player, { info: st.track }, st.requester, st.lines, player.position / 1000, st.lyricsVisible)).catch(() => { });
    }
};