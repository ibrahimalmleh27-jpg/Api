import express from "express"
import fetch from "node-fetch"
import yts from "yt-search"
import ytdl from "ytdl-core"

const app = express()
app.use(express.static("public"))

/* ================== YOUTUBE ================== */

// 🔍 بحث
app.get("/api/youtube/search", async (req, res) => {
  let q = req.query.q
  let r = await yts(q)
  res.json(r.videos.slice(0, 5))
})

// 🎬 تحميل فيديو
app.get("/api/youtube/video", async (req, res) => {
  let url = req.query.url
  let info = await ytdl.getInfo(url)

  res.json({
    title: info.videoDetails.title,
    download: `https://your-domain/api/youtube/stream?url=${url}`
  })
})

// 🎧 تحميل صوت
app.get("/api/youtube/audio", async (req, res) => {
  let url = req.query.url

  res.json({
    status: true,
    download: `https://your-domain/api/youtube/audio-stream?url=${url}`
  })
})

// stream فيديو
app.get("/api/youtube/stream", (req, res) => {
  ytdl(req.query.url, { filter: "audioandvideo" }).pipe(res)
})

// stream صوت
app.get("/api/youtube/audio-stream", (req, res) => {
  ytdl(req.query.url, { filter: "audioonly" }).pipe(res)
})

/* ================== TIKTOK ================== */

app.get("/api/tiktok", async (req, res) => {
  let url = req.query.url

  let r = await fetch(`https://api.tiklydown.eu.org/api/download?url=${url}`)
  let d = await r.json()

  res.json({
    video: d.video.noWatermark
  })
})

/* ================== SPOTIFY ================== */

app.get("/api/spotify/search", async (req, res) => {
  let q = req.query.q

  let r = await fetch(`https://api.ootaizumi.web.id/downloader/spotifyplay?query=${q}`)
  let d = await r.json()

  res.json(d)
})

/* ================== PINTEREST ================== */

app.get("/api/pinterest/search", async (req, res) => {
  let q = req.query.q
  let r = await fetch(`https://pinterest-api-one.vercel.app/?q=${q}`)
  let d = await r.json()

  res.json(d)
})

/* ================== MAIN ================== */

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html")
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("🔥 RUNNING"))