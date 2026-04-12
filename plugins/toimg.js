let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) throw `*『 ⚠️ 』يـرجـى الـرد عـلـى الـمـلـصـق الـذي تـريـد تـحـويـلـه لـصـورة.*\n\n*📌 مـثـال:*\n${usedPrefix + command}`
    
    const q = m.quoted || m
    let mime = q.mediaType || ''
    if (/webp/.test(mime)) throw `*『 ❌ 』هـذا الأمـر مـخـصـص لـلـمـلـصـقـات فـقـط.*`
    
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })
    
    let media = await q.download()
    
    let caption = `
*╭───〔 🔱 تـحـويـل إلـى صـورة 〕───╼*
*│*
*│* ✨ **تـم الـتـحـويـل بـنـجـاح**
*│* ⚡ **بـواسطـة:** INOSUKE BOT
*│*
*╰────────────────────╼* 🐗`.trim()

    await conn.sendMessage(m.chat, { image: media, caption: caption }, { quoted: m })
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
}

handler.help = ['لصورة <رد على ملصق>']
handler.tags = ['sticker']
handler.command = /^(toimg|لصورة)$/i
handler.limit = true 

export default handler
