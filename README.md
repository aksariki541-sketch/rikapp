# MusifyRik 3.0

A web music player backed by YouTube Music search/streaming, packaged for
one-click deployment on **Netlify**.

This is a **major upgrade of MusifyRik 2.0** focused on stability, the music
player, UI/UX, search, queue, playlist, minimal lyrics, mobile experience,
performance, and bug fixing — **without an equalizer** (the old Web Audio
equalizer from 2.0 was removed entirely).

## What changed in 3.0

- **Queue** — real queue with play-from-queue, remove per-track, clear all,
  reorder (move up/down), current track always highlighted. Connected to
  Next/Previous.
- **Shuffle** — proper shuffle order (no immediate repeats, keeps current
  track), synced with Next/Previous.
- **Repeat** — 3 modes: Off / All / One, with matching icons.
- **Recently Played** — persisted history (capped at 20) shown on Home.
- **Three-dot menu** — on every search result: Play now, Play next, Add to
  queue, Add to playlist, Favorite, Share, Song info.
- **Share** — Web Share API with clipboard fallback + toast feedback.
- **Compact lyrics** — replaced the fullscreen overlay with a clean bottom
  sheet; smaller, readable lines with active-line highlight and sync controls.
- **Search** — debounced suggestions, loading / empty / error states with a
  retry button, song duration, artwork fallbacks.
- **Empty / error states** — home, search, queue, liked, library.
- **Audio error handling** — validates API responses and retries a track once
  with a fresh URL on playback errors (expired streams).
- **Autoplay-safe** — never forces audio on first load; failed autoplay is
  caught and the player stays usable.
- **Performance & a11y** — lazy images, lighter transitions,
  `prefers-reduced-motion` support, aria-labels, better touch targets.
- **Security** — API secrets moved to environment variables
  (`YT_MUSIC_API_KEY`, `ASSEMBLYAI_API_KEY`) with safe fallbacks.
- **Cleanup** — removed duplicate functions, dead code, and the equalizer.

## Project structure

```
public/                    -> static site (Netlify "publish" directory)
api/                        -> original handler logic (req, res) — shared source
netlify/functions/          -> thin Netlify Function wrappers around api/*.js (JSON endpoints)
netlify/edge-functions/     -> Edge Function for audio streaming
netlify.toml                -> Netlify build & routing configuration
server.js                   -> plain Express server, used only for local dev (npm run dev)
```

No build step is required — the site is plain HTML/CSS/JS. On Netlify the
backend runs entirely as Netlify Functions / Edge Functions; locally it runs
through `server.js` (or `netlify dev`, which matches production behavior).

## Deploy to Netlify

### Option A — Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Option B — Git integration
1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Netlify: **Add new site → Import an existing project**.
3. Build settings are already defined in `netlify.toml` (publish = `public`,
   functions = `netlify/functions`) — no changes needed.
4. Deploy.

### Option C — Drag & drop
Zip the whole project folder (including `netlify.toml`, `netlify/`, `api/`
and `public/`) and drag it onto the Netlify dashboard deploy area.

Optional environment variables (with built-in fallbacks):
`YT_MUSIC_API_KEY`, `ASSEMBLYAI_API_KEY`.

Required only for the **Import Spotify Playlist** feature (no fallback —
never hardcode these, never expose them to the frontend):
`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`. Create an app at
[developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
to obtain these; they're used server-side only via the Client Credentials
flow to read public playlist metadata.

## API routes

| Route                | Backend                                                           |
|-----------------------|-------------------------------------------------------------------|
| `/api/search`         | Netlify Function (`netlify/functions/search.js`)                 |
| `/api/lyrics`         | Netlify Function                                                  |
| `/api/artist`         | Netlify Function                                                  |
| `/api/album`          | Netlify Function                                                  |
| `/api/suggest`        | Netlify Function                                                  |
| `/api/ytplay`         | Netlify Function                                                  |
| `/api/transcribe`     | Netlify Function (also used internally by `/api/lyrics`)         |
| `/api/spotify`        | Netlify Function — resolves a Spotify playlist URL into metadata for the Import Spotify Playlist feature |
| `/api/proxy-audio`    | **Edge Function** (streams audio bytes, with Range/206 support)  |

## Local development
```bash
npm install
npm run dev        # plain Express server on port 3000
# or
npx netlify dev    # runs the static site + Functions + Edge Functions locally
```
