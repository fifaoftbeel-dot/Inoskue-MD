let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text)
    return m.reply(
      `أدخل اسم التطبيق \n\nمثال:\n${usedPrefix + command} facebook lite\n\n\n المرجو كتابة الأمر متبوعاً باسم التطبيق الذي تريد تحميله`,
    );

  conn.apk = conn.apk ? conn.apk : {};

  if (text.split("").length <= 2 && !isNaN(text) && m.sender in conn.apk) {
    text = text.replace(/http:\/\/|https:\/\//i, "");
    let dt = conn.apk[m.sender];
    if (dt.download) return m.reply("جاري التحميل بالفعل، يرجى الانتظار!");
    try {
      dt.download = true;
      let data = await aptoide.download(dt.data[text - 1].id);
      let caption = `
الاسم : ${data.appname}
المطور : ${data.developer}
`.trim();

      await conn.sendMessage(
        m.chat,
        {
          image: { url: data.img },
          caption: caption,
        },
        { quoted: m },
      );

      let dl = await conn.getFile(data.link);
      conn.sendMessage(
        m.chat,
        {
          document: dl.data,
          fileName: data.appname + ".apk",
          mimetype: dl.mime,
        },
        { quoted: m },
      );
    } catch (e) {
      console.error(e);
      m.reply("حدث خطأ أثناء تحميل ملف الـ APK.");
    } finally {
      dt.download = false;
    }
  } else {
    let data = await aptoide.search(text);

    if (!data || data.length === 0) {
      return m.reply("لم يتم العثور على نتائج لبحثك.");
    }

    let caption = data
      .map((v, i) => {
        return `
${i + 1}. ${v.name}
• الحجم : ${v.size}
• الإصدار : ${v.version}
• التحميلات : ${v.download}
• المعرف : ${v.id}
`.trim();
      })
      .join("\n\n");

    let header = `_يرجى التحميل عن طريق كتابة *${usedPrefix + command} 1*_\n\n\nقم بالإشارة لهذه الرسالة والرد بكتابة الأمر متبوعاً برقم التطبيق الذي تود تحميله، مثال:\n\n*.apk 1*\n\n`;
    m.reply(header + caption);

    conn.apk[m.sender] = {
      download: false,
      data: data,
      time: setTimeout(() => {
        delete conn.apk[m.sender];
      }, 3600000), 
    };
  }
};

handler.help = ["apk"];
handler.tags = ["downloader"];
handler.command = /^(apk|تطبيق)$/i;
handler.limit = true;

export default handler;

const aptoide = {
  search: async function (args) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(args)}&limit=1000`,
    );
    res = await res.json();

    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      return [];
    }

    return res.datalist.list.map((v) => {
      return {
        name: v.name,
        size: v.size,
        version: v.file?.vername || 'غير معروف',
        id: v.package,
        download: v.stats?.downloads || 0,
      };
    });
  },

  download: async function (id) {
    let res = await global.fetch(
      `https://ws75.aptoide.com/api/7/apps/search?query=${encodeURIComponent(id)}&limit=1`,
    );
    res = await res.json();

    if (!res.datalist || !res.datalist.list || res.datalist.list.length === 0) {
      throw new Error("لم يتم العثور على التطبيق.");
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
