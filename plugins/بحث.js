import yts from 'yt-search'
import fs from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*『 ⚠️ 』يـرجـى كـتـابـة مـا تـريد الـبـحـث عـنـه.*\n\n*📌 مـثـال:*\n${usedPrefix + command} سورة الكهف`)
  
  await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } })
  
  let results = await yts(text)
  let tes = results.all
  let teks = results.all.map(v => {
    switch (v.type) {
      case 'video': return `*🎬 الاسـم:* _${v.title}_\n*🕒 الـمـدة:* _${v.timestamp}_\n*📅 مـنـذ:* _${v.ago}_\n*👁 الـمـشاهـدات:* _${v.views}_\n*🔗 الـرابـط:* ${v.url}`
    }
  }).filter(v => v).join('\n\n*◈═════════════════◈*\n\n')
  
  let finalCaption = `
*╭───〔 🔱 نـتـائـج الـبـحـث 〕───╼*
*│*
${teks}
*│*
*╰────────────────────╼* 🐗`.trim()
  
  conn.sendFile(m.chat, tes[0].thumbnail, 'yts.jpeg', finalCaption, m)
  await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.help = ['بحث <نص>'] 
handler.tags = ['search']
handler.command = ['yts', 'ytsearch', 'بحث', 'يوتيوب'] 
handler.limit = 1

export default handler
