import axios from 'axios'
import { Blob, FormData } from 'formdata-node'

class NoiseReducer {
  constructor() {
    this.uploadUrl = "https://apiv2.noise-reducer.com/denoiser/v3/noise-reductions/upload/"
    this.serverTimeUrl = "https://apiv2.noise-reducer.com/core/v1/server-time/"
    this.headers = {
      accept: "application/json, text/plain, */*",
      "accept-language": "ar-MA",
      "cache-control": "no-cache",
      origin: "https://noise-reducer.com",
      referer: "https://noise-reducer.com/",
      "user-agent": "Mozilla/5.0"
    }
    this.uploadHeaders = {
      ...this.headers,
      "Content-Type": "multipart/form-data",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site"
    }
  }

  async getServerTime() {
    try {
      const response = await axios.get(this.serverTimeUrl, { headers: this.headers })
      return response.data.server_time
    } catch (e) {
      return new Date().toISOString()
    }
  }

  async noiseRemove(buffer, mime = "audio/mpeg") {
    const filename = "input.mp3"
    const blob = new Blob([buffer], { type: mime })
    const form = new FormData()
    form.set("input_audio", blob, filename)
    form.set("platform", "5")
    form.set("is_recorded", "false")
    form.set("original_file_format", mime)
    form.set("original_file_size", buffer.length.toString())
    form.set("original_file_name", filename)
    form.set("upload_started_at", await this.getServerTime())
    form.set("pre_processing_time", "16")

    const uploadRes = await axios.post(this.uploadUrl, form, {
      headers: {
        ...this.uploadHeaders,
        ...form.headers
      }
    })

    const task = uploadRes.data.noise_reduction_infos?.[0]
    const token = uploadRes.data.access_token
    if (!task?.id || !token) throw new Error("ERR")

    return await this.poll(task.id, token)
  }

  async poll(taskId, token) {
    const url = `https://apiv2.noise-reducer.com/denoiser/v3/noise-reductions/${taskId}/`
    const headers = { ...this.headers, 'access-token': token }

    while (true) {
      const { data } = await axios.get(url, { headers })
      if (data.conversion_status === 3 && data.output_audio)
        return data
      await new Promise(res => setTimeout(res, 2000))
    }
  }
}

let handler = async (m, { conn, text }) => {
  let buffer, mime
  const quoted = m.quoted ? m.quoted : m

  if (text && text.startsWith('http')) {
    try {
      const res = await axios.get(text, { responseType: 'arraybuffer' })
      buffer = res.data
      mime = res.headers['content-type']
    } catch {
      return m.reply('❌ *فـشـل تـحـمـيـل الـمـلـف مـن الـرابط.*')
    }
  }
  else if (quoted?.mimetype?.startsWith('audio')) {
    try {
      buffer = await quoted.download()
      mime = quoted.mimetype
    } catch {
      return m.reply('❌ *فـشـل جـلـب الـصـوت مـن الـرسـالة.*')
    }
  } else {
    return m.reply('*『 ⚠️ 』يـرجـى إرسـال رابـط صـوت أو الـرد عـلـى مـقـطـع صـوتـي.*')
  }

  await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

  try {
    const reducer = new NoiseReducer()
    const result = await reducer.noiseRemove(buffer, mime)
    if (!result?.output_audio) throw new Error('ERR')

    let caption = `
*╭───〔 🔱 تـنـقـيـة الـصـوت 〕───╼*
*│*
*│* ✨ **تـم إزالـة الـضـوضـاء بـنـجـاح**
*│* ⚡ **بـواسطـة:** INOSUKE BOT
*│*
*╰────────────────────╼* 🐗`.trim()

    await conn.sendFile(m.chat, result.output_audio, 'cleaned.mp3', caption, m)
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
  } catch (err) {
    m.reply("❌ *عـفـواً، حـدث خـطأ أثـنـاء مـعـالـجـة الـصـوت.*")
  }
}

handler.help = ['تنقية <رد على صوت>']
handler.tags = ['tools']
handler.command = ['noiseremove', 'تنقية', 'تصفية']
handler.limit = true

export default handler
