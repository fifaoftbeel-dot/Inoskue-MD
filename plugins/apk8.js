import axios from 'axios';

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`*『 ⚠️ 』يـرجـى كـتـابـة اسـم الـتـطـبـيـق لـلـبـحـث.*\n\n*📌 مـثـال:*\n.${command} Instagram`);

  try {
    await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });
    
    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(text)}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data.datalist || !data.datalist.list || !data.datalist.list.length) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      return m.reply("*『 ❌ 』لـم يـتـم الـعـثـور عـلـى الـتـطـبـيـق.*");
    }

    const app = data.datalist.list[0];
    const sizeMB = (app.size / (1024 * 1024)).toFixed(2);

    if (sizeMB > 260) return m.reply(`*『 ⚠️ 』الـحـجـم كـبـير جـداً (${sizeMB} MB).*`);

    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

    let caption = `
*╭───〔 🔱 تـحـمـيـل APK 〕───╼*
*│* 💠 **الاسـم:** ${app.name}
*│* 💾 **الـحـجـم:** ${sizeMB} MB
*│* ⚡ **بـواسطـة:** INOSUKE BOT
*╰────────────────────╼* 🐗`.trim();

    await conn.sendMessage(m.chat, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: 'application/vnd.android.package-archive',
      caption: caption
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
  } catch (e) {
    m.reply(`*『 ❌ 』حـدث خـطأ.*`);
  }
}

// التعديل هنا ليظهر في القائمة باسم "تطبيق2"
handler.help = ['تطبيق2'] 
handler.tags = ['downloader']
handler.command = ['apk8', 'تطبيق', 'تطبيق2', 'برنامج'] 
handler.limit = true;

export default handler;
