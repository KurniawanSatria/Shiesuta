process.on("unhandledRejection", (e) => global.log.error(`Unhandled: ${e?.message ?? e}`));
process.on("uncaughtException", (e) => global.log.error(`Uncaught: ${e?.message ?? e}`));
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { Connectors } = require("shoukaku");
const { Kazagumo } = require("kazagumo");
const Spotify = require("kazagumo-spotify");
const { loadEmojis } = require("./lib/emoji");
const state = require("./lib/state");
const cfg = require("./config.json");
const chalk = require('chalk');
const moment = require('moment-timezone');


console.clear();


const getTime = () => chalk.bgWhite.black.italic(` ${moment().tz("Asia/Jakarta").format("HH:mm:ss")} `);
const format = (label, color, msg) => `${getTime()} ${color.bold(`[${label}]`)} ${chalk.gray(msg)}`;
global.log = {
    info: (msg) => console.log(format("INFO", chalk.blueBright, msg)),
    warn: (msg) => console.log(format("WARN", chalk.yellowBright, msg)),
    error: (msg) => console.log(format("ERROR", chalk.redBright, msg)),
    debug: (msg) => console.log(format("DEBUG", chalk.greenBright, msg)),
};



const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
client.activePlayers = new Map();

const cleanMessages = async () => {
    if (!cfg.cleanMode || !client.isReady()) return;
    const cutoff = Date.now() - 60000;
    for (const guild of client.guilds.cache.values()) {
        for (const channel of guild.channels.cache.values()) {
            if (!channel.isTextBased?.() || !channel.messages?.fetch) continue;
            const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
            if (!messages) continue;
            const nowPlayingId = state.npState.get(guild.id)?.msg?.id;
            messages.filter(message => message.author.id === client.user.id && message.id !== nowPlayingId && message.createdTimestamp <= cutoff)
                .forEach(message => message.delete().catch(error => global.log.warn(`Clean mode delete failed in ${channel.id}: ${error.message}`)));
        }
    }
};

setInterval(() => cleanMessages().catch(error => global.log.error(`Clean mode error: ${error.message}`)), 10000);


const Nodes = cfg.nodes
const kazagumo = new Kazagumo({
    plugins: [
        new Spotify({ clientId: cfg.spotify?.clientId ?? "", clientSecret: cfg.spotify?.clientSecret ?? "", playlistPageLimit: 2, albumPageLimit: 1, artistPageLimit: 1, searchLimit: 10, searchMarket: cfg.spotify?.searchMarket ?? "ID" })
    ],
    defaultSearchEngine: "youtube",
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    }
}, new Connectors.DiscordJS(client), Nodes, { reconnectTries: 10, reconnectInterval: 5000, restTimeout: 60000, resumable: true, resumableTimeout: 60000 });



const commands = new Map();
const cmdDir = path.join(__dirname, "commands");
for (const f of fs.readdirSync(cmdDir).filter(f => f.endsWith(".js"))) {
    const c = require(path.join(cmdDir, f));
    commands.set(c.name, c);
}



const ctx = { client, kazagumo, commands };
const loadEvents = (dir, emitter, argBuilder) => {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
        const e = require(path.join(dir, f));
        if (e.emitter && e.emitter !== argBuilder.name) continue;
        emitter[e.once ? "once" : "on"](e.name, (...args) => e.run(ctx, ...argBuilder(args)));
    }
};



kazagumo.client = client;



const evDir = path.join(__dirname, "events/");
loadEvents(path.join(evDir, "client"), client, function client(args) { return args; });
loadEvents(path.join(evDir, "kazagumo"), kazagumo, function kazagumo(args) { return args; });



kazagumo.shoukaku.on('close', (name, code, reason) => global.log.warn(`Lavalink ${name}: Closed, Code ${code}, Reason ${reason || 'No reason'}`));
kazagumo.shoukaku.on('debug', (name, info) => global.log.debug(`Lavalink ${name}: Debug, ${info}`));
kazagumo.shoukaku.on("error", (name, error) => global.log.error(`Lavalink ${name}: ${error}`));
kazagumo.shoukaku.on('ready', (name) => global.log.info(`Lavalink ${name}: Ready!`));




client.once(Events.ClientReady, async c => {
    await loadEmojis(c);
    await cleanMessages();
    global.log.info(`Ready! Logged in as ${c.user.tag}`);
});
client.on('error', (error) => global.log.error(`Client error: ${error}`));
client.login(cfg.token);
