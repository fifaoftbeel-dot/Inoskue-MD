let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!m.text.startsWith('.') && !m.text.startsWith('/') && !m.text.startsWith('!') && !m.text.startsWith('#')) {
    return;
  }

  if (!text) {
    return m.reply(
      `*『 ⚠️ 』يـرجـى كـتـابـة اسـم الـتـطـبـيـق لـلـبـحـث عـنـه.*\n\n*📌 مـثـال:*\n${usedPrefix + command} Facebook Lite`,
    );
  }

  await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

  try {
    let data = await aptoide.search(text);

    if (!data || data.length === 0) {
      return m.reply("❌ *عـفـواً، لـم أجـد أي نـتـائـج لـهـذا الاسـم.*");
    }

    let app = data[0];
    let downloadData = await aptoide.download(app.id);

    let caption = `
*╭───〔 🔱 تـم الـعـثـور عـلـى الـتـطـبـيـق 〕───╼*
*│*
*│* 🎮 *الاسـم:* ${downloadData.appname}
*│* 👨‍💻 *الـمـطـور:* ${downloadData.developer}
*│* 📦 *الـحـجـم:* ${app.size || 'غير معروف'}
*│* 🔖 *الإصـدار:* ${app.version || 'غير معروف'}
*│* ⚡ *بـواسطـة:* INOSUKE BOT
*│*
*╰────────────────────╼* 🐗`.trim();

    await conn.sendMessage(m.chat, {
        image: { url: downloadData.img },
        caption: caption,
      }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

    let dl = await conn.getFile(downloadData.link);

    await conn.sendMessage(m.chat, {
        document: dl.data,
        fileName: `${downloadData.appname}.apk`,
        mimetype: dl.mime || "application/vnd.android.package-archive",
        contextInfo: {
          externalAdReply: {
            title: `💎 ${downloadData.appname} 💎`,
            body: "ᴅᴏwnʟᴏᴀᴅᴇᴅ ʙʏ ɪɴᴏsᴜᴋᴇ sʏsᴛᴇᴍ",
            mediaType: 1,
            sourceUrl: downloadData.link,
            thumbnailUrl: downloadData.img,
            renderLargerThumbnail: true,
            showAdAttribution: false
          }
        }
      }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    m.reply("❌ *عـفـواً، حـدث خـطأ أثـنـاء الـمـعـالـجـة.*");
  }
};

handler.help = ["تطبيق <الاسم>"];
handler.tags = ["downloader"];
handler.command = /^(apk|تطبيق)$/i;
handler.limit = true;

export default handler;

const aptoide = {
  search: async function (args) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(args)}&limit=10`
    );
    res = await res.json();
    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      return [];
    }
    return res.datalist.list.map((v) => ({
      name: v.name,
      size: v.size,
      version: v.file?.vername || 'غير معروف',
      id: v.package,
      download: v.stats?.downloads || 0,
    }));
  },

  download: async function (id) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`
    );
    res = await res.json();
    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      throw new Error("ERR");
    }
    const app = res.datalist.list[0];
    return {
      img: app.icon,
      developer: app.store?.name || 'غير معروف',
      appname: app.name,
      link: app.file?.path,
    };
  },
};
ير معروف',
      appname: app.name,
      link: app.file?.path,
    };
  },
};
