<p align="center">
<img alt="Shiesuta" src="https://raw.githubusercontent.com/KurniawanSatria/Shiesuta/refs/heads/main/assets/banner.png"/>
</p>

<h1 align="center">Shiesuta Music Bot</h1>

<p align="center">
A modern Discord music bot powered by
<strong>Discord.js</strong>,
<strong>lavalink-client</strong>, and
<strong>Lavalink</strong>.
</p>

<p align="center">
<img src="https://img.badges.sh/badge?label=Node.js&message=&color=dfb317&labelColor=339933&style=for-the-badge&labelTextColor=ffffff&logo=nodedotjs&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="Node.js: " />
<img src="https://img.badges.sh/badge?label=Discordj.s&message=&color=dfb317&labelColor=5865F2&style=for-the-badge&logo=discord&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="Discordj.s: " />
<img src="https://img.badges.sh/badge?label=Lavalink&message=&color=dfb317&labelColor=FC552A&style=for-the-badge&labelTextColor=ffffff&logo=linksys&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="Lavalink: " />
</p>

## Features

- Play music from YouTube, YouTube Music, Spotify, and SoundCloud
- Queue, skip, previous, pause/resume, stop, loop, shuffle, and volume controls
- Autoplay with source-aware search
- Live synced lyrics that can be enabled from Now Playing
- Lavalink node failover when a node becomes unavailable
- Components V2 for Now Playing and response cards
- English, Indonesian, and Malay translations

## Supported Sources

<p align="center">
<a href="https://open.spotify.com"><img src="https://img.badges.sh/badge?label=spotify&message=&color=ffc800&labelColor=1ED660&style=for-the-badge&logo=spotify&logoColor=212121&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="spotify: " /></a>
<a href="https://www.youtube.com"><img src="https://img.badges.sh/badge?label=youtube&message=&color=ffc800&labelColor=FF0033&style=for-the-badge&labelTextColor=ffffff&logo=youtube&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="youtube: " /></a>
<a href="https://soundcloud.com"><img src="https://img.badges.sh/badge?label=soundcloud&message=&color=ffc800&labelColor=FF4100&style=for-the-badge&labelTextColor=000000&logo=soundcloud&logoColor=000000&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="soundcloud: " /></a>

## Requirements

- Bun `>=1.2.0`
- Node.js for syntax checks
- MongoDB
- Lavalink v4 with the required sources/plugins
- Discord bot token

## Setup

1. Install dependencies:

```bash
bun install
```

2. Create `config.json` in the project root:

```json
{
  "token": "DISCORD_BOT_TOKEN",
  "mongodb": "MONGODB_URI",
  "prefix": ".",
  "ownerId": "DISCORD_OWNER_ID",
  "defaultLang": "en",
  "cleanMode": true,
  "searchPlatform": "spsearch",
  "nodes": [
    {
      "name": "main",
      "url": "localhost:2333",
      "auth": "youshallnotpass",
      "secure": false
    }
  ],
  "donate": {
    "url": "https://example.com/donate",
    "chance": 0
  }
}
```

Do not commit `config.json`; it contains tokens and credentials.

## Run

```bash
bun index.js
```

Development mode:

```bash
bun --watch index.js
```

The bot requires a Discord token, a running MongoDB instance, and at least one reachable Lavalink node. Do not run the full bot without these prerequisites.

## Commands

The default prefix is `.`.

| Command | Usage |
| --- | --- |
| Play | `.play <query or URL>` |
| Queue | `.queue [page]` |
| Skip | `.skip` |
| Previous | Previous button in Now Playing |
| Pause / Resume | `.pause`, `.resume`, or the Now Playing buttons |
| Stop | `.stop` or the Now Playing button |
| Loop | `.loop [track\|queue\|off]` |
| Shuffle | `.shuffle` |
| Volume | `.volume [0-100]` |
| Autoplay | `.autoplay` or `.set autoplay <on\|off>` |
| Settings | `.set <lang\|prefix\|autoplay\|volume> <value>` |
| Help | `.help` |

## Configuration

- `prefix`: default command prefix.
- `defaultLang`: `en`, `id`, or `ms`.
- `searchPlatform`: Lavalink search source such as `spsearch`, `ytsearch`, or `ytmsearch`.
- `nodes`: Lavalink nodes used for playback and failover.
- `cleanMode`: periodically delete old bot responses.
- `donate.chance`: percentage chance of showing the donation card when the player is destroyed.

Guild settings such as prefix, language, volume, and autoplay are stored in MongoDB.

## Project Structure

- `index.js`: entrypoint, Discord client, Lavalink manager, loaders, and node failover.
- `commands/`: command handlers.
- `events/client/`: Discord client events and button interactions.
- `events/lavalink/`: playback, queue, track, and node events.
- `lib/`: autoplay, database, lyrics, UI, state, and emoji loader.
- `lang/`: translation files.
- `docs/`: static website, separate from the bot runtime.

## Validation

This project does not use a test runner, linter, or CI. Use syntax checks:

```bash
node --check index.js
node --check commands/play.js
node --check lib/ui.js
```

## Website

Website documentation and static files are described in [`docs/README.md`](docs/README.md).
