const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Events, Message, MessagePayload } = require("discord.js");
const { LavalinkManager, Player } = require("lavalink-client");
const { autoPlayFunction } = require("./lib/autoplay");
const state = require("./lib/state");
const cfg = require("./config.json");
const chalk = require('chalk');
const moment = require('moment-timezone');
const { connect } = require("./lib/mongo");

Object.defineProperty(MessagePayload.prototype, "isMessage", {
    get() {
        return Boolean(this.target && (this.target instanceof Message || this.target.constructor?.name === "Message" || ("author" in this.target && "channelId" in this.target)));
    }
});

Message.prototype.reply = function (options) {
    if (!this.channel) return;
    const payload = options instanceof MessagePayload ? options : { ...options, allowedMentions: { parse: [] } };
    const data = payload instanceof MessagePayload ? payload : MessagePayload.create(this.channel, payload, {
        reply: {
            messageReference: this.id,
            failIfNotExists: payload?.failIfNotExists ?? this.client.options.failIfNotExists
        }
    });
    return this.channel.send(data);
};


console.clear();



const logDir = path.join(__dirname, "logs");
fs.mkdirSync(logDir, { recursive: true });
let logDate = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
let logStream = fs.createWriteStream(path.join(logDir, `shiesuta-${logDate}.log`),{ flags: "a" });
const getTime = () => chalk.bold(chalk.gray(`${moment().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss")}`));
const format = (label, color, msg) => `${getTime()} ${color(label)} --- : ${chalk.bold(msg)}`;
const fmtArgs = (args) => args.map(a => a instanceof Error ? (a.stack ?? a.message) : typeof a === "object" && a !== null ? JSON.stringify(a) : String(a)).join(" ");
const writeLog = (text) => {
    console.log(text);
    const date = moment().tz("Asia/Jakarta").format("YYYY-MM-DD");
    if (date !== logDate) {
        logStream.end();
        logDate = date;
        logStream = fs.createWriteStream(path.join(logDir, `shiesuta-${logDate}.log`),{ flags: "a" });
    }
    const clean = text.replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
    logStream.write(clean + "\n");
};
global.log = {
    info: (...msg) => writeLog(format("INFO", chalk.blueBright, fmtArgs(msg))),
    warn: (...msg) => writeLog(format("WARN", chalk.yellowBright, fmtArgs(msg))),
    error: (...msg) => writeLog(format("ERROR", chalk.redBright, fmtArgs(msg))),
    debug: (...msg) => writeLog(format("DEBUG", chalk.greenBright, fmtArgs(msg))),
};

process.on("unhandledRejection", (e) => global.log.error(`Unhandled: ${e?.message ?? e}`));
process.on("uncaughtException", (e) => global.log.error(`Uncaught: ${e?.message ?? e}`));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

Object.defineProperty(Player.prototype, "guild", {
    get() {
        return client.guilds.cache.get(this.guildId) ?? { id: this.guildId, name: "" };
    }
});

const isDestroyMsg = (m) => state.destroyMessages?.has(m.id) || (JSON.stringify(m.components).includes("Thank you for using our service!") && Boolean(state.destroyMessages?.add(m.id)));

const cleanMessages = async () => {
    if (!cfg.cleanMode || !client.isReady()) return;
    const cutoff = Date.now() - 60000;
    for (const guild of client.guilds.cache.values()) {
        for (const channel of guild.channels.cache.values()) {
            if (!channel.isTextBased?.() || !channel.messages?.fetch) continue;
            const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
            if (!messages) continue;
            const nowPlayingId = state.npState.get(guild.id)?.msg?.id;
            messages.filter(message => message.author.id === client.user.id && message.id !== nowPlayingId && !isDestroyMsg(message) && message.createdTimestamp <= cutoff).forEach(message => message.delete().catch(error => global.log.warn(`Clean mode delete failed in ${channel.id}: ${error.message}`)));
        }
    }
};

setInterval(() => cleanMessages().catch(error => global.log.error(`Clean mode error: ${error.message}`)), 60000);


const parseNodeTarget = (n) => {
    const raw = String(n.url ?? `${n.host ?? "localhost"}:${n.port ?? 2333}`).replace(/^https?:\/\//i, "");
    const idx = raw.lastIndexOf(":");
    if (idx === -1) return { host: raw, port: 2333 };
    return { host: raw.slice(0, idx), port: Number(raw.slice(idx + 1)) || 2333 };
};

const Nodes = (cfg.nodes ?? []).map(n => {
    const { host, port } = parseNodeTarget(n);
    return {
        id: n.id ?? n.name ?? "main",
        host,
        port,
        authorization: n.authorization ?? n.auth ?? "youshallnotpass",
        secure: n.secure ?? false,
        retryAmount: n.retryAmount ?? 25,
        retryDelay: n.retryDelay ?? 10e3,
        requestSignalTimeoutMS: n.requestSignalTimeoutMS ?? 10000
    };
});

const lavalink = new LavalinkManager({
    nodes: Nodes,
    sendToShard: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    },
    autoSkip: true,
    autoSkipOnResolveError: true,
    autoMove: false,
    emitNewSongsOnly: true,
    client: {
        id: client.user?.id ?? "unknown",
        username: "Shiesuta"
    },
    playerOptions: {
        defaultSearchPlatform: cfg.searchPlatform ?? cfg.searchPlatfor ?? "ytmsearch",
        applyVolumeAsFilter: false,
        clientBasedPositionUpdateInterval: 1000,
        volumeDecrementer: 0.75,
        maxErrorsPerTime: {
            threshold: 35000,
            maxAmount: 3
        },
        minAutoPlayMs: 10000,
        onDisconnect: {
            autoReconnect: true,
            destroyPlayer: false
        },
        onEmptyQueue: {
            destroyAfterMs: 60000,
            autoPlayFunction: autoPlayFunction
        },
        useUnresolvedData: true
    },
    queueOptions: {
        maxPreviousTracks: 25
    },
    linksAllowed: true,
    advancedOptions: {
        enableDebugEvents: false
    }
});

client.lavalink = lavalink;

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
        const full = path.join(dir, f);
        const e = require(full);
        if (!e.name || typeof e.run !== "function") continue;
        if (e.emitter && e.emitter !== argBuilder.name) continue;
        emitter[e.once ? "once" : "on"](e.name, (...args) => require(full).run(ctx, ...argBuilder(args)));
    }
};

const evDir = path.join(__dirname, "events/");
loadEvents(path.join(evDir, "client"), client, function client(args) { return args; });
loadEvents(path.join(evDir, "lavalink"), lavalink, function lavalink(args) { return args; });

const reloadTimers = new Map();
const reloadFile = (dir, file) => {
    if (!file?.endsWith(".js")) return;
    const full = path.join(dir, file);
    if (!fs.existsSync(full)) {
        if (dir.includes("commands")) {
            for (const [name] of commands.entries()) {
                if (file.startsWith(name)) commands.delete(name);
            }
            return global.log.warn(`Hot reload: [cmd] ${file} removed`);
        }
        return;
    }
    try { delete require.cache[require.resolve(full)]; } catch (_) { }
    if (dir.includes("commands")) {
        try {
            const c = require(full);
            if (c?.name) {
                commands.set(c.name, c);
                global.log.info(`Hot reload: [cmd] ${c.name}`);
            }
        } catch (e) {
            global.log.error(`Hot reload [cmd] error: ${e.message}`);
        }
    } else if (dir.includes("lib")) {
        for (const f of fs.readdirSync(cmdDir).filter(f => f.endsWith(".js"))) {
            const p = path.join(cmdDir, f);
            try { delete require.cache[require.resolve(p)]; } catch (_) { }
            const c = require(p);
            if (c?.name) commands.set(c.name, c);
        }
        global.log.info(`Hot reload: [lib] ${file}`);
    } else if (dir.includes("events")) {
        const emitter = dir.includes("lavalink") ? lavalink : client;
        try {
            const e = require(full);
            if (!e?.name || typeof e.run !== "function") return;
            if (e?.name && !emitter.listenerCount?.(e.name)) {
                emitter[e.once ? "once" : "on"](e.name, (...args) => require(full).run(ctx, ...args));
            }
        } catch (_) { }
        global.log.info(`Hot reload: [event] ${file}`);
    }
};

const watchDir = (dir) => {
    if (!fs.existsSync(dir)) return;
    fs.watch(dir, (_, file) => {
        if (!file?.endsWith(".js")) return;
        const key = path.join(dir, file);
        if (reloadTimers.has(key)) clearTimeout(reloadTimers.get(key));
        reloadTimers.set(key, setTimeout(() => {
            reloadTimers.delete(key);
            reloadFile(dir, file);
        }, 150));
    });
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        if (item.isDirectory() && !["node_modules", ".git", ".vscode", "docs", "emojis"].includes(item.name)) {
            watchDir(path.join(dir, item.name));
        }
    }
};

["commands", "events", "lib"].forEach(d => watchDir(path.join(__dirname, d)));



lavalink.nodeManager
    .on("connect", (node) => {
        global.log.info(`Lavalink ${node.id}: Ready!`);
        node.updateSession(true, 360e3).catch((e) => global.log.warn(`Lavalink ${node.id}: session resume setup failed: ${e?.message ?? e}`));
    })
    .on("disconnect", async (node, reason) => {
        const affected = [...lavalink.players.values()].filter(p => p?.node?.options?.id === node.id).length;
        global.log.warn(`Lavalink ${node.id}: Disconnected${affected ? ` (${affected} player(s) auto-moving via autoMove)` : ""}, Reason: ${typeof reason === "object" ? JSON.stringify(reason) : reason ?? "No reason"}`);
        if (affected) {
            const { handleNodeFailover } = require("./events/lavalink/nodeFailover");
            await handleNodeFailover({ client, lavalink, commands }, node, reason);
        }
    })
    .on("reconnecting", (node) => global.log.warn(`Lavalink ${node.id}: Reconnecting...`))
    .on("destroy", (node, reason) => {
        global.log.error(`Lavalink ${node.id}: destroyed (${reason ?? "no reason"}) — re-adding in 30s`);
        const opts = Nodes.find(n => n.id === node.id);
        if (!opts) return;
        setTimeout(() => {
            if (lavalink.nodeManager.nodes.has(node.id)) return;
            try {
                lavalink.nodeManager.createNode(opts);
                global.log.info(`Lavalink ${node.id}: re-added, reconnecting...`);
            } catch (e) {
                global.log.error(`Lavalink ${node.id}: re-add failed: ${e?.message ?? e}`);
            }
        }, 30000);
    })
    .on("resumed", (node, payload, players) => global.log.info(`Lavalink ${node.id}: session resumed (${players?.length ?? 0} players)`))
    .on("error", (node, error) => global.log.error(`Lavalink ${node.id}: ${error?.message ?? error?.error?.message ?? JSON.stringify(error)}`));

lavalink.on("debug", (eventKey, eventData) => global.log.debug(`Lavalink debug [${eventKey}]:`, eventData));




client.once(Events.ClientReady, async c => {
    lavalink.init({ id: c.user.id, username: c.user.username });
    await cleanMessages();
    global.log.info(`Ready! Logged in as ${c.user.tag}`);
});
client.on('error', (error) => global.log.error(`Client error: ${error}`));

connect().then(() => client.login(cfg.token)).catch(e => {
    global.log.error(`MongoDB connection failed: ${e.message}`);
    process.exit(1);
});
