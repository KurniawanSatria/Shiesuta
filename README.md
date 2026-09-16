<p align="center">
<img width="2048" height="877" alt="Shiesuta" src="https://github.com/user-attachments/assets/b57d67da-9dc7-46a9-84a8-87008f567691"/>
</p>

<h1 align="center">Shiesuta Music Bot</h1>

<p align="center">
A modern Discord music bot powered by
<strong>Discord.js</strong>,
<strong>Kazagumo</strong>,
<strong>Shoukaku</strong>, and
<strong>Lavalink</strong>.
</p>

<p align="center">
<img src="https://img.badges.sh/badge?label=Node.js&message=&color=dfb317&labelColor=339933&style=for-the-badge&labelTextColor=ffffff&logo=nodedotjs&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="Node.js: " />
<img src="https://img.badges.sh/badge?label=Discordj.s&message=&color=dfb317&labelColor=5865F2&style=for-the-badge&logo=discord&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="Discordj.s: " />
<img src="https://img.badges.sh/badge?label=Lavalink&message=&color=dfb317&labelColor=FC552A&style=for-the-badge&labelTextColor=ffffff&logo=linksys&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="Lavalink: " />
</p>



___

## Features

-   🎵 Music playback through Lavalink
-   🔎 Search by song title or URL
-   📋 Queue support
-   ⏯️ Play / pause / resume
-   🔀 Shuffle
-   🔁 Loop Mode (track, queue, none)
-   ⏭️ Skip tracks
-   ⏹️ Stop and destroy the player
-   🎧 Discord voice channel support
-   🎶 Spotify integration through `kazagumo-spotify`
-   ⚡ Powered by Bun or Node.js
-   🖥️ Designed for VPS / game-panel hosting environments

___

## Requirements

Before running the bot, make sure you have:

-   [Node.js](https://nodejs.org/) 20+ **or** [Bun](https://bun.sh/)
-   A Discord application and bot token
-   A running **Lavalink v4** server
-   A Discord bot with the required intents enabled

### Required Discord Intents

Enable these intents in the Discord Developer Portal:

-   `Guilds`
-   `Guild Voice States`
-   `Guild Messages`
-   `Message Content`

___


## Configuration

Create `config.json`:

``` json
{
	"token": "YOUR_BOT_TOKEN", // get it from https://discord.com/developers/applications/YOUR_APPLICATION/bot
	"prefix": ".",
	"defaultLang": "en",
	"nodes": [
		{
			"name": "main",
			"url": "localhost:80",
			"auth": "youshallnotpass",
			"secure": false
		}
	],
	"spotify": {
		"clientId": "YOUR_SPOTIFY_CLIENT_ID",  // get it from 
		"clientSecret": "YOUR_SPOTIFY_CLIENT_SECRET",  // get it from https://developer.spotify.com/dashboard/YOUR_APPLICATION
		"searchMarket": "ID"
	},
	"donate": {
		"url": "https://saweria.co/Saturiaaa",
		"chance": 0.1
	}
}

```

> [!IMPORTANT]
> **Never publish your bot token.** Add `config.json` to `.gitignore`.



___

## Quick Start

``` bash
# Clone the repository
git clone https://github.com/USERNAME/Shiesuta.git
cd Shiesuta

# Copy the default configuration file
cp config.json.example config.json

# Install dependencies
npm install

# Start the bot
npm start
```

___


## Lavalink

This bot uses Lavalink as the audio server.

Example node configuration:

``` js
const Nodes = [
		{
			"name": "main",
			"url": "localhost:80",
			"auth": "youshallnotpass",
			"secure": false
		}
	],
```
> [!NOTE]
> Make sure the address, port, password, and `secure` setting match your Lavalink server.

___

## Project Structure

``` text
Shiesuta/
├── assets/
│   └── saturiahost-logo-transparent.png
├── index.js
├── config.json
├── config.example.json
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

___

## 🎮 Available Commands

| Command | Description |
|:-------|:------------|
| `.play <query>` | Play or queue a song |
| `.skip` | Skip the current track |
| `.shuffle` | Shuffle the queue |
| `.loop <mode>` | Set loop mode: `track`, `queue`, or `none` |
| `.pause` | Pause playback |
| `.resume` | Resume playback |
| `.stop` | Stop playback and destroy the player |
| `.set lang` | Set the language |


Examples:

``` text
.play Never Gonna Give You Up
.play https://www.youtube.com/watch?v=...
.pause
.resume
.skip
.stop
.loop track
.shuffle
```

---

## 🎧 Supported Sources

<p align="center">
<a href="https://open.spotify.com"><img src="https://img.badges.sh/badge?label=spotify&message=&color=ffc800&labelColor=1ED660&style=for-the-badge&logo=spotify&logoColor=212121&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="spotify: " /></a>
&nbsp;&nbsp;
<a href="https://www.youtube.com"><img src="https://img.badges.sh/badge?label=youtube&message=&color=ffc800&labelColor=FF0033&style=for-the-badge&labelTextColor=ffffff&logo=youtube&logoColor=ffffff&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="youtube: " /></a>
&nbsp;&nbsp;
<a href="https://soundcloud.com"><img src="https://img.badges.sh/badge?label=soundcloud&message=&color=ffc800&labelColor=FF4100&style=for-the-badge&labelTextColor=000000&logo=soundcloud&logoColor=000000&font=Poppins&labelFontWeight=700&messageFontWeight=700" alt="soundcloud: " /></a>


---

## 💖 Support

If you enjoy **Shiesuta** and want to support its development:

<a href="https://trakteer.id/saturiaaa"><strong>&nbsp;Trakteer</strong></a><br>
<a href="https://saweria.co/Saturiaaa"><strong>&nbsp;Saweria</strong></a><br>
<a href="https://sociabuzz.com/saturiaaa"><strong>&nbsp;Sociabuzz</strong></a>


---

<p align="center"> Made with ❤️ for the Discord community. </p>
<p align="center"> <strong>Shiesuta Music Bot</strong></p>