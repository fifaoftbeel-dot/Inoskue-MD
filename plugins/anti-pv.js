let handler = m => m

handler.before = async function (m, { conn, isOwner }) {
    if (m.isGroup || isOwner || m.fromMe || m.isBaileys) return true

    if (m.chat.endsWith('@s.whatsapp.net')) {
        let warningMsg = `*『 🐗 تـنـبـيـه 』*\n\nعذراً، هذا البوت مخصص *للمجموعات فقط*!\nتابع قناتنا للتحديثات:\nhttps://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V\n\n*تم حظرك تلقائياً لمنع الإزعاج!* ⚔️`
        
        await conn.reply(m.chat, warningMsg, m)
        await conn.updateBlockStatus(m.sender, 'block')
        return false 
    }
    return true
}

export default handler
