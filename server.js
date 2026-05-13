// حل مشكلة ReferenceError: File is not defined في Railway
import { File, Blob } from 'node:buffer';
if (!global.File) global.File = File;
if (!global.Blob) global.Blob = Blob;

import express from "express";
import fetch from "node-fetch";
import yts from "yt-search";
import ytdl from "ytdl-core";

const app = express();
app.use(express.static("public"));

// دالة مساعدة لجلب البيانات من الـ APIs الخارجية
const fetchData = async (url) => {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

/* ================== YOUTUBE ================== */

// 1. بحث وتشغيل أغاني (هذا المسار الذي يستخدمه البوت)
app.get("/api/youtube/play-audio", async (req, res) => {
  try {
    let q = req.query.q;
    // التحقق من وجود نص البحث لمنع رسالة الخطأ التي ظهرت لك
    if (!q || q.trim() === "") {
        return res.status(400).json({ error: "يرجى إدخال اسم الأغنية للبحث" });
    }

    let r = await yts(q);
    if (!r.videos || r.videos.length === 0) {
        return res.json({ error: "❌ مفيش نتيجة" });
    }

    let video = r.videos[0]; 
    res.json({
      title: video.title,
      thumbnail: video.thumbnail,
      audio_url: `${req.protocol}://${req.get('host')}/api/youtube/audio-stream?url=${encodeURIComponent(video.url)}`
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "حدث خطأ في الخادم" });
  }
});

// 2. بحث وتشغيل فيديو مباشرة
app.get("/api/youtube/play-video", async (req, res) => {
  try {
    let q = req.query.q;
    if (!q) return res.status(400).json({ error: "اكتب اسم الفيديو" });
    
    let r = await yts(q);
    if (r.videos.length === 0) return res.json({ error: "❌ مفيش نتيجة" });
    
    let video = r.videos[0];
    res.json({
      title: video.title,
      thumbnail: video.thumbnail,
      video_url: `${req.protocol}://${req.get('host')}/api/youtube/stream?url=${encodeURIComponent(video.url)}`
    });
  } catch (e) { res.status(500).json({ error: "خطأ في الفيديو" }); }
});

// 3. تحميل يوتيوب بالرابط
app.get("/api/youtube/download", async (req, res) => {
  try {
    let url = req.query.url;
    if(!url) return res.status(400).json({ error: "ضع الرابط" });
    let info = await ytdl.getInfo(url);
    res.json({
      title: info.videoDetails.title,
      video: `${req.protocol}://${req.get('host')}/api/youtube/stream?url=${encodeURIComponent(url)}`,
      audio: `${req.protocol}://${req.get('host')}/api/youtube/audio-stream?url=${encodeURIComponent(url)}`
    });
  } catch (e) { res.status(500).json({ error: "الرابط غير صحيح" }); }
});

// Stream Helpers
app.get("/api/youtube/stream", (req, res) => {
  ytdl(req.query.url, { filter: "audioandvideo", quality: "highest" }).pipe(res);
});

app.get("/api/youtube/audio-stream", (req, res) => {
  ytdl(req.query.url, { filter: "audioonly" }).pipe(res);
});

/* ================== بقية الخدمات ================== */

app.get("/api/tiktok", async (req, res) => {
  try {
    let d = await fetchData(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(req.query.url)}`);
    res.json(d);
  } catch (e) { res.status(500).json({ error: "خطأ في تيك توك" }); }
});

app.get("/api/spotify/search", async (req, res) => {
  try {
    let d = await fetchData(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${encodeURIComponent(req.query.q)}`);
    res.json(d);
  } catch (e) { res.status(500).json({ error: "خطأ في سبوتيفاي" }); }
});

app.get("/api/pinterest/search", async (req, res) => {
  try {
    let d = await fetchData(`https://api.boxi.my.id/api/pinterest?q=${encodeURIComponent(req.query.q)}`);
    res.json(d);
  } catch (e) { res.status(500).json({ error: "خطأ في بينترست" }); }
});

app.get("/", (req, res) => { res.sendFile(process.cwd() + "/public/index.html"); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Server Running on ${PORT}`));
