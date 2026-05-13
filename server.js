import express from "express"
import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"

const app = express()
app.use(express.static("public"))

/* ================== YOUTUBE ================== */

// 🔍 بحث يوتيوب
app.get("/api/youtube/search", async (req, res) => {
  try {
    let q = req.query.q
    let r = await yts(q)
    res.json(r.videos.slice(0, 5))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 🎬 معلومات التحميل (فيديو)
app.get("/api/youtube/video", async (req, res) => {
  try {
    let url = req.query.url
    let info = await ytdl.getInfo(url)
    res.json({
      title: info.videoDetails.title,
      download: `/api/youtube/stream?url=${encodeURIComponent(url)}`
    })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// 📥 Stream فيديو (تحميل مباشر لـ Railway)
app.get("/api/youtube/stream", (req, res) => {
  const url = req.query.url
  res.header('Content-Disposition', 'attachment; filename="video.mp4"')
  ytdl(url, { filter: "audioandvideo" }).pipe(res)
})

// 📥 Stream صوت (تحميل مباشر لـ Railway)
app.get("/api/youtube/audio-stream", (req, res) => {
  const url = req.query.url
  res.header('Content-Disposition', 'attachment; filename="audio.mp3"')
  ytdl(url, { filter: "audioonly" }).pipe(res)
})

/* ================== TIKTOK ================== */

app.get("/api/tiktok", async (req, res) => {
  try {
    let url = req.query.url
    let r = await fetch(`https://api.tiklydown.eu.org/api/download?url=${url}`)
    let d = await r.json()
    res.json({
      video: d.video.noWatermark
    })
  } catch (e) {
    res.status(500).json({ error: "TikTok API Error" })
  }
})

/* ================== SPOTIFY ================== */

app.get("/api/spotify/search", async (req, res) => {
  try {
    let q = req.query.q
    let r = await fetch(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${q}`)
    let d = await r.json()
    res.json(d)
  } catch (e) {
    res.status(500).json({ error: "Spotify API Error" })
  }
})

/* ================== PINTEREST ================== */

app.get("/api/pinterest/search", async (req, res) => {
  try {
    let q = req.query.q
    let r = await fetch(`https://pinterest-api-one.vercel.app/?q=${q}`)
    let d = await r.json()
    res.json(d)
  } catch (e) {
    res.status(500).json({ error: "Pinterest API Error" })
  }
})

/* ================== MAIN ================== */

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html")
})

// 🛠️ إعدادات التشغيل لـ Railway
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔥 S7ADOW API IS READY ON PORT ${PORT}`)
})
