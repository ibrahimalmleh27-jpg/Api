// حل مشكلة File / Blob
import { File, Blob } from 'node:buffer';
if (!global.File) global.File = File;
if (!global.Blob) global.Blob = Blob;

import express from "express";
import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from "ytdl-core";

const app = express();
app.use(express.static("public"));

/* 🔥 حماية من الكراش */
process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

// دالة fetch محسنة
const fetchData = async (url) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
};

/* ================== YOUTUBE ================== */

// 🔍 تشغيل صوت (معدل لروابط البوتات)
app.get("/api/youtube/play-audio", async (req, res) => {
  try {
    let q = req.query.q;
    if (!q || q.trim() === "") return res.status(400).json({ error: "اكتب اسم الأغنية" });

    let r = await yts(q);
    if (!r.videos || r.videos.length === 0) return res.json({ error: "❌ مفيش نتيجة" });

    let video = r.videos[0];
    res.json({
      status: true,
      title: video.title,
      thumbnail: video.thumbnail,
      // الرابط بصيغة الـ API التي طلبتها لبوتات واتساب
      audio_url: `${req.protocol}://${req.get("host")}/api/youtube/audio-stream?url=${encodeURIComponent(video.url)}`
    });
  } catch (e) {
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// 🎬 تشغيل فيديو (معدل لروابط البوتات)
app.get("/api/youtube/play-video", async (req, res) => {
  try {
    let q = req.query.q;
    if (!q) return res.status(400).json({ error: "اكتب اسم الفيديو" });

    let r = await yts(q);
    if (!r.videos.length) return res.json({ error: "❌ مفيش نتيجة" });

    let video = r.videos[0];
    res.json({
      status: true,
      title: video.title,
      thumbnail: video.thumbnail,
      video_url: `${req.protocol}://${req.get("host")}/api/youtube/stream?url=${encodeURIComponent(video.url)}`
    });
  } catch {
    res.status(500).json({ error: "خطأ في الفيديو" });
  }
});

// 📥 تحميل من رابط (معدل لروابط البوتات)
app.get("/api/youtube/download", async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) return res.status(400).json({ error: "حط الرابط" });

    let info = await ytdl.getInfo(url);
    res.json({
      status: true,
      title: info.videoDetails.title,
      video: `${req.protocol}://${req.get("host")}/api/youtube/stream?url=${encodeURIComponent(url)}`,
      audio: `${req.protocol}://${req.get("host")}/api/youtube/audio-stream?url=${encodeURIComponent(url)}`
    });
  } catch {
    res.status(500).json({ error: "رابط غير صالح" });
  }
});

// 🔥 Stream (بدون تعديل - لمعالجة الطلبات)
app.get("/api/youtube/stream", (req, res) => {
  try {
    ytdl(req.query.url, { filter: "audioandvideo", quality: "highest" })
    .on("error", err => res.status(500).send(err.toString()))
    .pipe(res);
  } catch { res.status(500).send("Stream error"); }
});

app.get("/api/youtube/audio-stream", (req, res) => {
  try {
    ytdl(req.query.url, { filter: "audioonly" })
      .on("error", err => res.status(500).send(err.toString()))
      .pipe(res);
  } catch { res.status(500).send("Audio error"); }
});

/* ================== بقية الـ APIs (تيك توك، سبوتيفاي، بينترست) ================== */

app.get("/api/tiktok", async (req, res) => {
  try {
    let url = req.query.url;
    let d = await fetchData(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
    res.json({ status: true, video: d?.video?.noWatermark || null });
  } catch { res.status(500).json({ error: "TikTok error" }); }
});

app.get("/api/spotify/search", async (req, res) => {
  try {
    let q = req.query.q;
    let d = await fetchData(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(q)}`);
    res.json({ status: true, result: d.result || d });
  } catch { res.status(500).json({ error: "Spotify error" }); }
});

app.get("/api/pinterest/search", async (req, res) => {
  try {
    let q = req.query.q;
    let d = await fetchData(`https://api.boxi.my.id/api/pinterest?q=${encodeURIComponent(q)}`);
    res.json({ status: true, result: d.result || d });
  } catch { res.status(500).json({ error: "Pinterest error" }); }
});

app.get("/", (req, res) => { res.sendFile(process.cwd() + "/public/index.html"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log("🔥 Server Running on " + PORT); });
    res.status(500).json({ error: "رابط غير صالح" });
  }
});

// 🔥 Stream (مصلح)
app.get("/api/youtube/stream", (req, res) => {
  try {
    ytdl(req.query.url, {
      filter: "audioandvideo",
      quality: "highest"
    })
    .on("error", err => res.status(500).send(err.toString()))
    .pipe(res);
  } catch {
    res.status(500).send("Stream error");
  }
});

app.get("/api/youtube/audio-stream", (req, res) => {
  try {
    ytdl(req.query.url, { filter: "audioonly" })
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
    if (!url) return res.json({ error: "حط الرابط" });

    let d = await fetchData(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);

    res.json({
      status: true,
      video: d?.video?.noWatermark || null
    });

  } catch {
    res.status(500).json({ error: "TikTok error" });
  }
});

/* ================== SPOTIFY ================== */

app.get("/api/spotify/search", async (req, res) => {
  try {
    let q = req.query.q;
    if (!q) return res.json({ error: "اكتب بحث" });

    let d = await fetchData(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(q)}`);

    res.json({
      status: true,
      result: d.result || d
    });

  } catch {
    res.status(500).json({ error: "Spotify error" });
  }
});

/* ================== PINTEREST ================== */

app.get("/api/pinterest/search", async (req, res) => {
  try {
    let q = req.query.q;
    if (!q) return res.json({ error: "اكتب بحث" });

    let d = await fetchData(`https://api.boxi.my.id/api/pinterest?q=${encodeURIComponent(q)}`);

    res.json({
      status: true,
      result: d.result || d
    });

  } catch {
    res.status(500).json({ error: "Pinterest error" });
  }
});

/* ================== MAIN ================== */

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 Server Running on " + PORT);
});
