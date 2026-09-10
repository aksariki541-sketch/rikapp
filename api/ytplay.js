const axios = require('axios');
const crypto = require('crypto');

// Memory cache for audio stream URLs (valid 1.5 hours)
const ytCache = new Map();
const CACHE_TTL = 90 * 60 * 1000;

async function getDownload(url) {
  const idMatch = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ].find(p => p.test(url))?.exec(url)?.[1] || (url.length === 11 ? url : null);

  if (!idMatch) {
    console.error("Invalid URL or video ID:", url);
    return null;
  }

  // Check cache first
  const cached = ytCache.get(idMatch);
  if (cached && cached.expireAt > Date.now()) {
    console.log(`[EXTRACT] Cache hit for video ID: ${idMatch}`);
    return cached.data;
  }

  const fullUrl = "https://www.youtube.com/watch?v=" + idMatch;
  const cdns = ["cdn405.savetube.vip", "cdn403.savetube.vip", "cdn401.savetube.vip"];

  for (const cdn of cdns) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const api = axios.create({
          headers: {
            "content-type": "application/json",
            "origin": "https://yt.savetube.me",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
          },
          timeout: 25000
        });

        const infoResponse = await api.post(`https://${cdn}/v2/info`, { url: fullUrl });
        const encryptedData = infoResponse?.data?.data;
        if (!encryptedData) continue;

        const encrypted = Buffer.from(encryptedData, "base64");
        const decipher = crypto.createDecipheriv("aes-128-cbc",
          Buffer.from("C5D58EF67A7584E4A29F6C35BBC4EB12", "hex"),
          encrypted.slice(0, 16)
        );

        const decryptedBuffer = Buffer.concat([
          decipher.update(encrypted.slice(16)),
          decipher.final()
        ]);

        const decrypted = JSON.parse(decryptedBuffer.toString());
        const downloadRes = await api.post(`https://${cdn}/download`, {
          id: idMatch,
          downloadType: "audio",
          quality: "128",
          key: decrypted.key
        });

        const audioUrl = downloadRes.data?.data?.downloadUrl || downloadRes.data?.downloadUrl;
        if (audioUrl) {
          const result = {
            duration: `${Math.floor(decrypted.duration / 60)}:${(decrypted.duration % 60).toString().padStart(2, "0")}`,
            audio: audioUrl
          };
          ytCache.set(idMatch, { data: result, expireAt: Date.now() + CACHE_TTL });
          return result;
        }
      } catch (err) {
        console.error(`Extraction attempt ${attempt} on ${cdn} failed:`, err.message);
      }
    }
  }

  return null;
}

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') { res.status(200).end(); return; }
    if (req.method !== 'POST') { res.status(405).json({ status: false, message: 'Method not allowed' }); return; }

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    const url = (body.query || body.url || '').trim();
    if (!url) { res.status(400).json({ status: false, message: 'Parameter query wajib diisi' }); return; }

    console.log(`[EXTRACT] Starting extraction for: ${url}`);

    try {
        let audioData = await getDownload(url);

        if (audioData && audioData.audio) {
            console.log("[EXTRACT] Success");
            return res.status(200).json({
                status: true,
                result: {
                    duration: audioData.duration || null,
                    download: { audio: audioData.audio }
                }
            });
        }

        console.error("[EXTRACT] All methods failed");
        res.status(503).json({ status: false, error: "Media extraction services are currently overloaded. Please try another track." });
    } catch (err) {
        console.error("[EXTRACT] Fatal error:", err.message);
        res.status(500).json({ status: false, error: "Internal server error during extraction" });
    }
};
