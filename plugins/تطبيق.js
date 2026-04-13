let handler = async (m, { conn, usedPrefix, command, text }) => {

  if (!text)
    return conn.sendListButton(
      m.chat,
      `╭─── 「 **تـحـمـيـل تـطـبـيـق** 」 ───⚔️\n│\n│ 📲 أرسل اسم التطبيق الذي تريد تحميله\n│\n│ *مثال:*\n│ ${usedPrefix + command} instagram\n│\n╰──────────────────• 🐗`,
      {
        title: 'تطبيقات مقترحة',
        sections: [{
          title: '🔥 تطبيقات شائعة',
          rows: [
            { header: '📸 Instagram', title: 'تحميل Instagram', id: `${usedPrefix + command} instagram` },
            { header: '💬 WhatsApp', title: 'تحميل WhatsApp', id: `${usedPrefix + command} whatsapp` },
            { header: '🎵 TikTok', title: 'تحميل TikTok', id: `${usedPrefix + command} tiktok` },
            { header: '▶️ YouTube', title: 'تحميل YouTube', id: `${usedPrefix + command} youtube` },
            { header: '📘 Facebook', title: 'تحميل Facebook Lite', id: `${usedPrefix + command} facebook lite` },
          ]
        }]
      },
      'Inoskue Bot 🐗',
      m
    );

  conn.apk = conn.apk ? conn.apk : {};

  if (text.split('').length <= 2 && !isNaN(text) && m.sender in conn.apk) {
    let dt = conn.apk[m.sender];
    if (dt.download) return m.reply('جاري التحميل بالفعل، يرجى الانتظار!');

    try {
      dt.download = true;
      await conn.sendMessage(m.chat, { react: { text: '⬇️', key: m.key } });

      let data = await aptoide.download(dt.data[text - 1].id);

      const caption =
        `╭─── 「 **مـعـلـومـات الـتـطـبـيـق** 」 ───⚔️\n` +
        `│\n` +
        `│ 📛 *الاسم:* ${data.appname}\n` +
        `│ 👨‍💻 *المطور:* ${data.developer}\n` +
        `│\n` +
        `╰──────────────────• 🐗`;

      await conn.sendMessage(m.chat, {
        image: { url: data.img },
        caption: caption,
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: '📤', key: m.key } });

      let dl = await conn.getFile(data.link);
      await conn.sendMessage(m.chat, {
        document: dl.data,
        fileName: data.appname + '.apk',
        mimetype: dl.mime,
        caption: `✅ *${data.appname}*`,
      }, { quoted: m });

      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
      console.error(e);
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      m.reply('❌ حدث خطأ أثناء تحميل ملف الـ APK.');
    } finally {
      dt.download = false;
    }

  } else {
    await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

    let data = await aptoide.search(text);

    if (!data || data.length === 0) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(
        `╭─── 「 **لـا نـتـائـج** 」 ───⚔️\n│\n│ ❌ لم يتم العثور على نتائج لـ: *${text}*\n│\n╰──────────────────• 🐗`
      );
    }

    const rows = data.slice(0, 10).map((v, i) => ({
      header: `📲 ${v.name}`,
      title: `الحجم: ${(v.size / (1024 * 1024)).toFixed(1)} MB • الإصدار: ${v.version}`,
      description: `⬇️ ${Number(v.download).toLocaleString()} تحميل`,
      id: `${usedPrefix + command} ${i + 1}`,
    }));

    const listData = {
      title: `نتائج البحث عن: ${text}`,
      sections: [{
        title: '📦 التطبيقات المتاحة',
        rows: rows
      }]
    };

    conn.apk[m.sender] = {
      download: false,
      data: data,
      time: setTimeout(() => {
        delete conn.apk[m.sender];
      }, 3600000),
    };

    conn.sendListButton(
      m.chat,
      `╭─── 「 **نـتـائـج الـبـحـث** 」 ───⚔️\n│\n│ 🔍 *البحث عن:* ${text}\n│ 📦 *عدد النتائج:* ${data.length}\n│\n│ اختر التطبيق من القائمة أدناه\n│\n╰──────────────────• 🐗`,
      listData,
      'Inoskue Bot 🐗',
      m
    );
  }
};

handler.help = ['apk'];
handler.tags = ['downloader'];
handler.command = /^(apk|تطبيق)$/i;
handler.limit = true;

export default handler;

const aptoide = {
  search: async function (args) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(args)}&limit=10`,
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
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`,
    );
    res = await res.json();

    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      throw new Error('لم يتم العثور على التطبيق.');
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
