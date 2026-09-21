# AGENTS.md — Shiesuta (Discord music bot)

Address the owner as sir or master. Reply in Bahasa Indonesia mix English.

Bun + CommonJS (`require`) Discord music bot. `index.js` is the entrypoint;
`bun index.js` / `bun --watch index.js` are the only scripts (no tests, lint,
typecheck, or CI — verify with `node --check <file>`).

## Runtime prerequisites (cannot boot without these)

- `config.json` (gitignored) must exist at root — `index.js` and `lib/*`
  `require` it directly. There is no `.env` support. Keys: `token`,
  `mongodb`, `prefix`, `ownerId`, `nodes [{url|host, auth, secure}]`,
  `searchPlatform`, `donate {chance}`, `defaultLang`, `cleanMode`.
- Full boot needs a Discord token, MongoDB, and a reachable Lavalink node.
  Don't try to run the bot in a sandbox; use `node --check` for syntax.

## Architecture

- `index.js` — client setup, `LavalinkManager` config, command/event loaders,
  `fs.watch` hot-reload, node listeners. Manager tuning lives here:
  `destroyAfterMs: 60000` (idle leave), `volumeDecrementer: 0.75`,
  `clientBasedPositionUpdateInterval: 1000`.
- `commands/*.js` — `{ name, run(m, args, ctx) }` where
  `ctx = { client, lavalink, commands, player, t }`. `player` is pre-fetched
  (`lavalink.getPlayer(guild.id)`, may be undefined); `t` is the guild's
  translation object. Aliases live in `events/client/message.js` (`ALIASES`),
  not in the command files.
- `events/client/*.js` and `events/lavalink/*.js` — `{ name, emitter, once,
  run(ctx, ...args) }`. `emitter` must be exactly `"client"` or `"lavalink"`
  (loader matches it against the internal function name; a file without
  `name`/`emitter` is silently skipped).
- `lib/` — `autoplay.js` (queue-empty handler), `ui.js` (ComponentsV2 cards),
  `utils.js` (`purge`, `startIdle`, lyrics fetch), `db.js` (GuildSettings with
  in-memory cache — `set()` writes through, no manual invalidation needed),
  `i18n.js` (`T(guildId)`, JSON in `lang/`), `state.js` (per-guild maps:
  `pending`, `npState`, `idleTimers`), `mongo.js`, `emoji.js`.
- `docs/` is the static marketing website — unrelated to the bot runtime.

## Code style (owner rules, always follow)

- No comment lines in code — no `//`, `/* */`, or `#` comments. Code must be
  self-explanatory through naming.
- Keep code line-economical: prefer short, dense constructs over verbose
  multi-line equivalents. No blank-line padding, no redundant temporaries,
  no dead code.

## Conventions & gotchas

- Prefix commands; per-guild `prefix`/`lang`/`volume`/`autoPlay` come from
  Mongo (`GuildSettings`), falling back to `config.json`.
- `index.js` monkey-patches `Message.prototype.reply` and
  `Player.prototype.guild` — events rely on `player.guild?.name`; don't
  remove without updating all event files.
- Hot-reload (`fs.watch` on `commands/`, `events/`, `lib/`, 150ms debounce)
  re-registers commands but only adds event listeners when
  `listenerCount === 0` — event edits apply via the `require(full).run`
  closure, restarts are still safer for event changes.
- `playerUpdate` edits the Now Playing message at most once per 5s (Discord
  rate limits); keep lyric-edit logic throttled. `cleanMessages` sweeps
  bot messages every 60s when `cleanMode` is on.
- `playerDestroy` sends the donate card only `donate.chance`% of the time —
  keep it gated, it fires on every destroy (stop/idle).
- `config.json` holds live secrets (`token`, `mongodb` URI) and is gitignored
  — never commit it or print its values.
- `cfg.accessToken` (Discord user token) is legacy/unused — do not reintroduce
  any code that depends on it.

## lavalink-client v2 API notes (verified against installed 2.11.0)

- `player.pause()` / `player.resume()` take no arguments.
- `player.setRepeatMode(mode)` returns a promise — await it.
- Search: pass `{ query }` alone for URLs, `{ query, source }` for text;
  filter results with `lavalink.utils.isNotBrokenTrack(t)`.
- Autoplay signature is `(player, lastPlayedTrack)`; add a single track.
- Session resuming is wired in `index.js` (`updateSession(true, 360e3)` on
  node connect). Reference: https://tomato6966.github.io/lavalink-client/
