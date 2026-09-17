process.on("unhandledRejection", (e) => global.log.error(`Unhandled: ${e?.message ?? e}`));
process.on("uncaughtException", (e) => global.log.error(`Uncaught: ${e?.message ?? e}`));
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { LavalinkManager } = require("lavalink-client");
const { loadEmojis } = require("./lib/emoji");
const { autoPlayFunction } = require("./lib/autoplay");
const state = require("./lib/state");
const cfg = require("./config.json");
const chalk = require('chalk');
const moment = require('moment-timezone');


console.clear();


const getTime = () => chalk.bgWhite.black.italic(` ${moment().tz("Asia/Jakarta").format("HH:mm:ss")} `);
const format = (label, color, msg) => `${getTime()} ${color.bold(`[${label}]`)} ${chalk.gray(msg)}`;
const fmtArgs = (args) => args.map(a => a instanceof Error ? (a.stack ?? a.message) : typeof a === "object" && a !== null ? JSON.stringify(a) : String(a)).join(" ");
global.log = {
    info: (...msg) => console.log(format("INFO", chalk.blueBright, fmtArgs(msg))),
    warn: (...msg) => console.log(format("WARN", chalk.yellowBright, fmtArgs(msg))),
    error: (...msg) => console.log(format("ERROR", chalk.redBright, fmtArgs(msg))),
    debug: (...msg) => console.log(format("DEBUG", chalk.greenBright, fmtArgs(msg))),
};



const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

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


const Nodes = (cfg.nodes ?? []).map(n => {
    const [host, port] = String(n.url ?? `${n.host}:${n.port ?? 2333}`).split(":");
    return {
        id: n.id ?? n.name ?? "main",
        host,
        port: Number(port || 2333),
        authorization: n.authorization ?? n.auth ?? "youshallnotpass",
        secure: n.secure ?? false
    };
});

const lavalink = new LavalinkManager({
    nodes: Nodes,
    sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    autoSkip: true,
    client: {
        id: client.user?.id ?? "unknown",
        username: "Shiesuta"
    },
    playerOptions: {
        defaultSearchPlatform: cfg.searchPlatform ?? "ytmsearch",
        onDisconnect: {
            autoReconnect: true,
            destroyPlayer: false
        },
        onEmptyQueue: {
            autoPlayFunction: autoPlayFunction
        }
    },
    queueOptions: {
        maxPreviousTracks: 25
    }
});

client.on("raw", (packet) => lavalink.sendRawData(packet));



const commands = new Map();
const cmdDir = path.join(__dirname, "commands");
for (const f of fs.readdirSync(cmdDir).filter(f => f.endsWith(".js"))) {
    const c = require(path.join(cmdDir, f));
    commands.set(c.name, c);
}



const ctx = { client, lavalink, commands };
const loadEvents = (dir, emitter, argBuilder) => {
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) {
        const e = require(path.join(dir, f));
        if (e.emitter && e.emitter !== argBuilder.name) continue;
        emitter[e.once ? "once" : "on"](e.name, (...args) => e.run(ctx, ...argBuilder(args)));
    }
};



const evDir = path.join(__dirname, "events/");
loadEvents(path.join(evDir, "client"), client, function client(args) { return args; });
loadEvents(path.join(evDir, "lavalink"), lavalink, function lavalink(args) { return args; });



lavalink.nodeManager
    .on("connect", (node) => global.log.info(`Lavalink ${node.id}: Ready!`))
    .on("disconnect", (node, reason) => global.log.warn(`Lavalink ${node.id}: Disconnected, Reason: ${typeof reason === "object" ? JSON.stringify(reason) : reason ?? "No reason"}`))
    .on("reconnecting", (node) => global.log.warn(`Lavalink ${node.id}: Reconnecting...`))
    .on("error", (node, error) => global.log.error(`Lavalink ${node.id}: ${error?.message ?? error?.error?.message ?? JSON.stringify(error)}`));




client.once(Events.ClientReady, async c => {
    lavalink.init({ id: c.user.id, username: c.user.username });
    await loadEmojis(c);
    await cleanMessages();
    global.log.info(`Ready! Logged in as ${c.user.tag}`);
});
client.on('error', (error) => global.log.error(`Client error: ${error}`));
client.login(cfg.token);
