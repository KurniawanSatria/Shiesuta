const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { Connectors } = require("shoukaku");
const { Kazagumo } = require("kazagumo");
const Spotify = require("kazagumo-spotify");
const { loadEmojis } = require("./lib/emoji");
const cfg = require("./config.json");

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const Nodes = cfg.nodes

const kazagumo = new Kazagumo({
    plugins: [
        new Spotify({
            clientId: cfg.spotify?.clientId ?? "",
            clientSecret: cfg.spotify?.clientSecret ?? "",
            playlistPageLimit: 2,
            albumPageLimit: 1,
            artistPageLimit: 1,
            searchLimit: 10,
            searchMarket: cfg.spotify?.searchMarket ?? "ID",
        }),
    ],
    defaultSearchEngine: "youtube",
    send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
    }
}, new Connectors.DiscordJS(client), Nodes, {
    reconnectTries: 2,
    reconnectInterval: 15000,
    restTimeout: 15000,
    resumable: true,
    resumableTimeout: 30
});

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
const evDir = path.join(__dirname, "events");
loadEvents(evDir, client, function client(args) { return args; });
loadEvents(evDir, kazagumo, function kazagumo(args) { return args; });

kazagumo.shoukaku.on("error", (name, error) => console.error(`Lavalink ${name}:`, error));

client.once(Events.ClientReady, async c => {
    try {
        await loadEmojis(c);
    } catch (e) {
        console.error("loadEmojis error:", e);
    }
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(cfg.token);

