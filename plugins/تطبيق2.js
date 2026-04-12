import axios from 'axios';

let handler = async (m, { conn, text, command, usedPrefix }) => {
    
    if (!m.text.startsWith('.') && !m.text.startsWith('/') && !m.text.startsWith('!') && !m.text.startsWith('#')) {
        return;
    }

    if (!text) {
        await conn.sendMessage(m.chat, {
            text: `*『 ⚠️ 』يـرجـى كـتـابـة اسـم الـتـطـبـيـق لـلـبـحـث عـنـه.*\n\n*📌 مـثـال:*\n${usedPrefix + command} Facebook`
        }, { quoted: m });
        return; 
    }

    try {
        await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

        const apiUrl = `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(text)}&limit=1`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
            await conn.sendMessage(m.chat, {
                text: "❌ *عـفـواً، لـم يـتـم الـعـثـور عـلـى نـتـائـج صـحـيـحـة.*"
            }, { quoted: m });
            return; 
        }

        const app = data.datalist.list[0];
        const sizeMB = (app.size / (1024 * 1024)).toFixed(2);

        const caption = `
*╭───〔 🔱 تـحـمـيـل الـتـطـبـيـق 〕───╼*
*│*
*│* 🎮 *الاسم:* ${app.name}
*│* 📦 *الحزمة:* ${app.package}
*│* 📅 *التحديث:* ${app.updated}
*│* 📁 *الحجم:* ${sizeMB} MB
*│* ⚡ *بواسطة:* INOSUKE BOT
*│*
*╰────────────────────╼* 🐗`.trim();

        await conn.sendMessage(m.chat, {
            image: { url: app.icon },
            caption: `*『 🖼️ 』 أيـقـونـة الـتـطـبـيـق :*\n*${app.name}*`,
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

        await conn.sendMessage(m.chat, {
            document: { url: app.file.path_alt || app.file.path },
            fileName: `${app.name}.apk`,
            mimetype: 'application/vnd.android.package-archive',
            caption: caption,
            contextInfo: {
                externalAdReply: {
                    title: `💎 ${app.name} 💎`,
                    body: "ᴅᴏᴡɴʟᴏᴀᴅᴇᴅ ʙʏ ɪɴᴏsᴜᴋᴇ sʏsᴛᴇᴍ",
                    mediaType: 1,
                    sourceUrl: app.file.path_alt || app.file.path,
                    thumbnailUrl: app.icon,
                    renderLargerThumbnail: true,
                    showAdAttribution: false
                }
            } 
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
        await conn.sendMessage(m.chat, { 
            text: `❌ *حـدث خـطأ أثـنـاء مـعـالـجـة الـتـطـبـيـق.*` 
        }, { quoted: m });
    }
}

handler.help = ['تطبيق <الاسم>'];
handler.command = ['apk2', 'تطبيق2', 'برنامج2', 'اندرويد']; 
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
, 'تطبيق2', 'برنامج2']; 
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
