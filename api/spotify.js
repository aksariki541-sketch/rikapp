const axios = require('axios');

// SPOTIFY IMPORT — server-side only.
// Reads SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET from environment variables.
// The Client Secret NEVER touches the frontend, is never echoed back in a
// response, and is never logged. This file only returns playlist/track
// METADATA (name, description, cover, title, artist, album, duration) —
// it never fetches or proxies actual audio from Spotify.

let cachedToken = null; // { access_token, expiresAt }

function isValidPlaylistId(id) {
    return typeof id === 'string' && /^[a-zA-Z0-9]{10,}$/.test(id);
}

function extractPlaylistId(input) {
    if (!input) return '';
    const str = String(input).trim();
    // spotify:playlist:ID (Spotify's own URI scheme — unambiguous, safe to accept)
    const uriMatch = str.match(/^spotify:playlist:([a-zA-Z0-9]+)$/);
    if (uriMatch) return uriMatch[1];
    // https://open.spotify.com/playlist/ID?si=...&utm_source=...
    // A bare alphanumeric string is intentionally NOT accepted here — the
    // spec requires validating an actual Spotify playlist URL and rejecting
    // (without calling the Spotify API) anything that isn't one.
    try {
        const url = new URL(str);
        if (!/(^|\.)spotify\.com$/i.test(url.hostname)) return '';
        const m = url.pathname.match(/\/playlist\/([a-zA-Z0-9]+)/);
        if (m) return m[1];
    } catch (e) {
        // Not a valid URL at all.
    }
    return '';
}

async function getAppToken() {
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now + 5000) {
        return cachedToken.access_token;
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        const err = new Error('SPOTIFY_NOT_CONFIGURED');
        err.code = 'SPOTIFY_NOT_CONFIGURED';
        throw err;
    }

    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const { data } = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
            headers: {
                'Authorization': `Basic ${basic}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 15000
        }
    );

    cachedToken = {
        access_token: data.access_token,
        expiresAt: now + (data.expires_in || 3600) * 1000
    };
    return cachedToken.access_token;
}

function msToDuration(ms) {
    if (!ms && ms !== 0) return '';
    const totalSec = Math.round(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return min + '.' + String(sec).padStart(2, '0');
}

function sanitizeText(t) {
    if (!t) return '';
    return String(t).replace(/<[^>]*>/g, '').trim();
}

async function fetchPlaylist(playlistId, token) {
    const headers = { 'Authorization': `Bearer ${token}` };

    const metaRes = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
            headers,
            params: { fields: 'name,description,images,tracks.total,owner.display_name' },
            timeout: 15000
        }
    );

    const meta = metaRes.data;
    const cover = (meta.images && meta.images[0] && meta.images[0].url) || '';

    const tracks = [];
    let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    let params = {
        fields: 'items(track(name,artists(name),album(name),duration_ms,is_local)),next',
        limit: 100,
        offset: 0
    };

    // Paginate through all tracks (batch requests so we never block on one huge call).
    while (url) {
        const r = await axios.get(url, { headers, params, timeout: 15000 });
        const items = r.data.items || [];
        for (const item of items) {
            const t = item.track;
            if (!t || t.is_local) continue; // local files have no usable metadata
            tracks.push({
                title: sanitizeText(t.name),
                artist: sanitizeText((t.artists || []).map(a => a.name).join(', ')),
                album: sanitizeText(t.album ? t.album.name : ''),
                duration: msToDuration(t.duration_ms)
            });
        }
        if (r.data.next) {
            url = r.data.next;
            params = undefined; // `next` already has query params baked in
        } else {
            url = null;
        }
    }

    return {
        name: sanitizeText(meta.name) || 'Imported Playlist',
        description: sanitizeText(meta.description),
        cover,
        totalTracks: tracks.length,
        tracks
    };
}

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        if (res.status) return res.status(200).send('OK');
        return;
    }

    const rawInput = String(req.query.url || req.query.id || '').trim();
    if (!rawInput) {
        return res.status(400).json({ status: false, creator: 'Rikiz', message: 'Parameter url diperlukan' });
    }

    const playlistId = extractPlaylistId(rawInput);
    if (!playlistId || !isValidPlaylistId(playlistId)) {
        return res.status(400).json({ status: false, creator: 'Rikiz', message: 'Invalid Spotify playlist URL.' });
    }

    try {
        const token = await getAppToken();
        const playlist = await fetchPlaylist(playlistId, token);

        if (!playlist.tracks.length) {
            return res.status(200).json({
                status: false,
                creator: 'Rikiz',
                message: 'This playlist contains no available tracks.'
            });
        }

        return res.status(200).json({
            status: true,
            creator: 'Rikiz',
            result: {
                playlistId,
                name: playlist.name,
                description: playlist.description,
                cover: playlist.cover,
                totalTracks: playlist.totalTracks,
                tracks: playlist.tracks
            }
        });
    } catch (e) {
        if (e.code === 'SPOTIFY_NOT_CONFIGURED') {
            return res.status(503).json({ status: false, creator: 'Rikiz', message: 'Spotify import is not configured on this server.' });
        }

        const status = e.response && e.response.status;
        if (status === 404) {
            return res.status(404).json({ status: false, creator: 'Rikiz', message: 'Playlist not found.' });
        }
        if (status === 401 || status === 403) {
            return res.status(403).json({ status: false, creator: 'Rikiz', message: 'Unable to access this Spotify playlist.' });
        }
        if (status === 429) {
            return res.status(429).json({ status: false, creator: 'Rikiz', message: 'Too many requests. Please wait a moment and try again.' });
        }
        if (e.request && !e.response) {
            return res.status(502).json({ status: false, creator: 'Rikiz', message: 'Network error. Please check your connection and try again.' });
        }

        // Never leak internal details (stack traces, credentials, etc.) to the client.
        return res.status(500).json({ status: false, creator: 'Rikiz', message: 'Spotify API error. Please try again later.' });
    }
};
