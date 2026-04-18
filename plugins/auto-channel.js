let handler = m => m

handler.all = async function (m) {
    if (m.isGroup || m.fromMe || m.isBaileys) return !0

    const isOwner = m.sender.split('@')[0] === global.nomerown
    if (isOwner) return !0 

    let user = global.db.data.users[m.sender]
    
    if (new Date() - user.lastSeenPrivate < 86400000) return !0 

    let caption = `🐗 *مرحباً بك!*

أنصحك بمتابعة قناة البوت الرسمية للحصول على آخر التحديثات والمميزات الجديدة:

🔗 https://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V`.trim()

    await this.sendMessage(m.chat, { 
        text: caption,
        contextInfo: {
            externalAdReply: {
                title: "Inosuke BoT AI 🐗",
                body: "قناة التحديثات الرسمية",
                thumbnailUrl: "https://telegra.ph/file/26218.jpg", 
                sourceUrl: "https://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V",
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

    user.lastSeenPrivate = new Date() * 1
    return !1
}

export default handler
