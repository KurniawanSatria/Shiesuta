const fs = require("fs");
const { AttachmentBuilder } = require("discord.js");
const { EMOJI } = require("../../lib/emoji");
const state = require("../../lib/state");
const cfg = require("../../config.json");

module.exports = {
    name: "playerDestroy",
    emitter: "lavalink",
    once: false,
    async run(ctx, player, reason) {
        global.log.info(`Player destroyed on ${player.guildId} ${player.guild?.name ?? ""}${reason ? `: ${reason}` : ""}`);
        // Drop per-guild state so destroyed players never leave stale refs behind.
        state.npState.delete(player.guildId);
        const { purge, clearIdle } = require("../../lib/utils");
        clearIdle(player.guildId);
        await purge(player.guildId);
        // Only show the support card sometimes — every destroy (stop/skip/idle)
        // would otherwise spam channels. Chance is configurable (0-100).
        const chance = cfg.donate?.chance ?? 50;
        if (Math.random() * 100 >= chance) return;
        const channel = player.textChannelId ? ctx.client.channels.cache.get(player.textChannelId) : null;
        if (!channel) return;
        const thumb = new AttachmentBuilder(fs.readFileSync('assets/banner.png'), { type: "image/png", name: 'banner.png' });
        const msg = await channel.send({
            flags: 32768,
            allowedMentions: { parse: [] },
            files: [thumb],
            components: [
                {
                    type: 17,
                    components: [
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
                            type: 10,
                            content: `### Thank you for using our service!\n\nLoving the bot?
Consider supporting our work and the future development of the bot. Even a small donation helps a lot! ❤️\n\n**Support us:**
- <:trakteer:1550260356729938000> **[Trakteer](https://trakteer.id/saturiaaa.)** 
- <:saweria:1550260498686156810> **[Saweria](https://saweria.co/Saturiaaa)** 
- <:sociabuzz:1550260354255163423> **[Sociabuzz](https://sociabuzz.com/saturiaaa/)**`
                        }
                    ]
                }
            ]
        }).catch(() => null);
        if (msg) state.destroyMessages.add(msg.id);
    }
};
