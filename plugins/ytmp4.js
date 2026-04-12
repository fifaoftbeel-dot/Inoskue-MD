import axios from 'axios'

const CONFIG = {
  video: { ext: ["mp4"], q: ["144p", "240p", "360p", "480p", "720p", "1080p"] }
}

const headers = {
  accept: "application/json",
  "content-type": "application/json",
  "user-agent": "Mozilla/5.0 (Android)",
  referer: "https://ytmp3.gg/"
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function poll(statusUrl) {
  const { data } = await axios.get(statusUrl, { headers })
  if (data.status === "completed") return data
  if (data.status === "failed") throw new Error(data.message)
  await sleep(2000)
  return poll(statusUrl)
}

async function convertYouTube(url, quality = "720p") {
  if (!CONFIG.video.q.includes(quality)) {
    throw new Error(`جودة غير صالحة: ${CONFIG.video.q.join(", ")}`)
  }
  const { data: meta } = await axios.get("https://www.youtube.com/oembed", {
    params: { url, format: "json" }
  })
  const payload = {
    url,
    os: "android",
    output: {
      type: "video",
      format: "mp4",
      quality
    }
  }
  let downloadInit
  try {
    downloadInit = await axios.post("https://hub.ytconvert.org/api/download", payload, { headers })
  } catch {
    downloadInit = await axios.post("https://api.ytconvert.org/api/download", payload, { headers })
  }
  if (!downloadInit?.data?.statusUrl) throw new Error("ERR")
  const result = await poll(downloadInit.data.statusUrl)
  return {
    title: meta.title,
    author: meta.author_name,
    downloadUrl: result.downloadUrl,
    filename: `${meta.title.replace(/[^\w\s-]/gi, '')}.mp4`
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`*『 ⚠️ 』يـرجـى إرسـال رابـط الـفـيـديـو الـمـراد تـحـمـيـلـه.*\n\n*📌 مـثـال:*\n${usedPrefix + command} https://youtu.be/xxxxx 720p`)
  }

  try {
    const url = args[0]
    const quality = args[1] || "720p"

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    const result = await convertYouTube(url, quality)

    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } })

    let caption = `
*╭───〔 🔱 يـوتـيـوب مـرئـي 〕───╼*
*│*
*│* 💠 **الاسـم:** ${result.title}
*│* 📺 **الـقـناة:** ${result.author}
*│* 🎞 **الـجـودة:** ${quality}
*│* ⚡ **بـواسطـة:** INOSUKE BOT
*│*
*╰────────────────────╼* 🐗`.trim()

    await conn.sendMessage(m.chat, { react: { text: "📤", key: m.key } })

    await conn.sendFile(m.chat, result.downloadUrl, result.filename, caption, m)

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (err) {
    m.reply("❌ *عـفـواً، حـدث خـطأ أثـنـاء مـعـالـجـة الـفـيـديـو.*")
  }
}

handler.help = ['فيديو <رابط>']
handler.tags = ['downloader']
handler.command = ['ytmp4', 'فيديو', 'فيد']
handler.limit = true

export default handler
 })

  } catch (err) {
    m.reply("❌ *حدث خطأ:* " + err.message)
  }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = ['ytmp4', 'فيديو', 'فيد']
handler.limit = true

export default handler
