// حل مشكلة ReferenceError: File is not defined في بيئة Railway
import { File, Blob } from 'node:buffer';
if (!global.File) global.File = File;
if (!global.Blob) global.Blob = Blob;

import express from "express";
import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from "ytdl-core";

const app = express();
app.use(express.static("public"));

/* ================== YOUTUBE ================== */

// 🔍 بحث
app.get("/api/youtube/search", async (req, res) => {
  try {
    let q = req.query.q;
    let r = await yts(q);
    res.json(r.videos.slice(0, 5));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🎬 تحميل فيديو
app.get("/api/youtube/video", async (req, res) => {
  try {
    let url = req.query.url;
    let info = await ytdl.getInfo(url);
    res.json({
      title: info.videoDetails.title,
      download: `/api/youtube/stream?url=${encodeURIComponent(url)}`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 🎧 تحميل صوت
app.get("/api/youtube/audio", async (req, res) => {
  res.json({
    status: true,
    download: `/api/youtube/audio-stream?url=${encodeURIComponent(req.query.url)}`
  });
});

// stream فيديو
app.get("/api/youtube/stream", (req, res) => {
  ytdl(req.query.url, { filter: "audioandvideo" }).pipe(res);
});

// stream صوت
app.get("/api/youtube/audio-stream", (req, res) => {
  ytdl(req.query.url, { filter: "audioonly" }).pipe(res);
});

/* ================== TIKTOK ================== */

app.get("/api/tiktok", async (req, res) => {
  try {
    let url = req.query.url;
    let r = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
    let d = await r.json();
    res.json({ video: d.video.noWatermark });
  } catch (e) {
    res.status(500).json({ error: "خطأ في جلب بيانات تيك توك" });
  }
});

/* ================== SPOTIFY ================== */

app.get("/api/spotify/search", async (req, res) => {
  try {
    let q = req.query.q;
    let r = await fetch(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(q)}`);
    let d = await r.json();
    res.json(d);
  } catch (e) {
    res.status(500).json({ error: "خطأ في بحث سبوتيفاي" });
  }
});

/* ================== PINTEREST ================== */

app.get("/api/pinterest/search", async (req, res) => {
  try {
    let q = req.query.q;
    let r = await fetch(`https://pinterest-api-one.vercel.app/?q=${encodeURIComponent(q)}`);
    let d = await r.json();
    res.json(d);
  } catch (e) {
    res.status(500).json({ error: "خطأ في بحث بينترست" });
  }
});

/* ================== MAIN ================== */

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 API is running on port ${PORT}`));
