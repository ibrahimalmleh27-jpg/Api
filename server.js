import express from "express";
import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from "ytdl-core";
import path from "path";
import { fileURLToPath } from "url";

/* 🔥 حماية من الكراش */
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.static(path.join(__dirname, "public")));

/* ================== YOUTUBE API ================== */

// 🔍 البحث
app.get("/api/youtube/search", async (req, res) => {
  try {
    let q = req.query.q;
    if (!q) return res.json([]);
    let r = await yts(q);
    res.json(r.videos.slice(0, 5));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🎬 معلومات الفيديو
app.get("/api/youtube/video", async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) return res.json({ error: "no url" });

    let info = await ytdl.getInfo(url);

    res.json({
      title: info.videoDetails.title,
      download: `/api/youtube/stream?url=${encodeURIComponent(url)}`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🎧 صوت
app.get("/api/youtube/audio", (req, res) => {
  let url = req.query.url;
  res.json({
    status: true,
    download: `/api/youtube/audio-stream?url=${encodeURIComponent(url)}`
  });
});

// 📥 فيديو
app.get("/api/youtube/stream", (req, res) => {
  try {
    const url = req.query.url;
    res.header('Content-Disposition', 'attachment; filename="video.mp4"');

    ytdl(url, { filter: "audioandvideo" })
      .on("error", err => res.status(500).send(err.toString()))
      .pipe(res);
  } catch {
    res.status(500).send("Stream error");
  }
});

// 📥 صوت
app.get("/api/youtube/audio-stream", (req, res) => {
  try {
    const url = req.query.url;
    res.header('Content-Disposition', 'attachment; filename="audio.mp3"');

    ytdl(url, { filter: "audioonly" })
      .on("error", err => res.status(500).send(err.toString()))
      .pipe(res);
  } catch {
    res.status(500).send("Audio error");
  }
});

/* ================== TIKTOK ================== */

app.get("/api/tiktok", async (req, res) => {
  try {
    let url = req.query.url;
    let r = await fetch(`https://api.tiklydown.eu.org/api/download?url=${url}`);
    let d = await r.json();
    res.json({ video: d?.video?.noWatermark || null });
  } catch {
    res.status(500).json({ error: "TikTok API Error" });
  }
});

/* ================== SPOTIFY ================== */

app.get("/api/spotify/search", async (req, res) => {
  try {
    let q = req.query.q;
    let r = await fetch(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${q}`);
    let d = await r.json();
    res.json(d);
  } catch {
    res.status(500).json({ error: "Spotify API Error" });
  }
});

/* ================== PINTEREST ================== */

app.get("/api/pinterest/search", async (req, res) => {
  try {
    let q = req.query.q;
    let r = await fetch(`https://pinterest-api-one.vercel.app/?q=${q}`);
    let d = await r.json();
    res.json(d);
  } catch {
    res.status(500).json({ error: "Pinterest API Error" });
  }
});

/* ================== MAIN ================== */

// 🔥 مهم جدًا
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Server running on port " + PORT);
});
