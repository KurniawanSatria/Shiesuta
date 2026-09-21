const { Events, ActivityType } = require('discord.js');
const { loadEmojis } = require('../../lib/emoji');
const GuildSettings = require('../../lib/models/GuildSettings');
const { setLang } = require('../../lib/i18n');
const db = require('../../lib/db');
module.exports = {
    name: Events.ClientReady,
    emitter: "client",
    once: true,
    async run(ctx, client) {
        try {
            global.log.info(`Logged in as ${client.user.tag} (${client.user.id})`);
            const guilds = client.guilds.cache.size;
            const users = client.guilds.cache.reduce((acc, guild) => acc + (guild.memberCount ?? 0), 0);
            global.log.info(`Serving ${guilds} guild(s) with ~${users} member(s)`);
            client.user.setPresence({ status: 'online', activities: [{ name: 'The Detective Is Already Dead', type: ActivityType.Watching }] });
            await loadEmojis(client);
            const allSettings = await GuildSettings.find();
            for (const s of allSettings) {
                if (s.lang) setLang(s.guildId, s.lang);
                db.setCache(s.guildId, s);
            }
        } catch (error) {
            global.log.error('Error in ready event:', error);
        }
    },
};
