let handler = m => m

handler.before = async function (m, { conn, isOwner }) {
    // Ignore groups, the owner, the bot itself, and system messages
    if (m.isGroup || isOwner || m.fromMe || m.isBaileys) return true

    // Check if the message is in a private chat (DM)
    if (m.chat.endsWith('@s.whatsapp.net')) {
        let warningMsg = `*『 🐗 SYSTEM ALERT 』*\n\nSorry, this bot is strictly for *Groups Only*!\nFollow our channel for updates:\nhttps://whatsapp.com/channel/0029Vb7obv8Fy72937jJb32V\n\n*You have been automatically blocked to prevent spam!* ⚔️`
        
        // Send the warning message
        await conn.reply(m.chat, warningMsg, m)
        
        // Block the user immediately
        await conn.updateBlockStatus(m.sender, 'block')
        
        // Stop the bot from processing any further commands from this user
        return false 
    }
    return true
}

export default handler
