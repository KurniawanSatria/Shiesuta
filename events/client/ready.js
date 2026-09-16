const { Events, ActivityType } = require('discord.js');

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
        } catch (error) {
            global.log.error('Error in ready event:', error);
        }
    },
};
