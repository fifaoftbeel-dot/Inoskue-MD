let handler = async (m, { conn, text, usedPrefix, command }) => {

  try {
    const query = text ? text.trim() : '';

    if (!query) {
      return m.reply(
        `╭─── 「 **تـشـغـيـل صـوت** 」 ───⚔️\n` +
        `│\n` +
        `│ ❌ *نسيت كتابة اسم الأغنية أو الرابط!*\n` +
        `│\n` +
        `│ *مثال:*\n` +
        `│ ${usedPrefix + command} سورة البقرة\n` +
        `│\n` +
        `╰──────────────────• 🐗`
      );
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const response = await fetch(`https://api.nexray.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.status || !data.result?.download_url) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(
        `╭─── 「 **لـم يـتـم الـعـثـور** 」 ───⚔️\n` +
        `│\n` +
        `│ ❌ *عذراً، لم أجد نتائج لـ:* "${query}"\n` +
        `│ جرب البحث باسم آخر أو رابط مختلف.\n` +
        `│\n` +
        `╰──────────────────• 🐗`
      );
    }

    const result    = data.result;
    const audioUrl  = result.download_url;
    const filename  = result.title     || 'صوت غير معروف';
    const thumbnail = result.thumbnail || '';
    const sourceUrl = result.url       || '';
    const duration  = result.duration  || 'غير معروف';
    const views     = result.views     || 'غير معروف';
    const channel   = result.channel   || 'غير معروف';

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

    const caption =
      `╭─── 「 **تـم الـتـحـمـيـل** 」 ───⚔️\n` +
      `│\n` +
      `│ 🎵 *العنوان:* ${filename}\n` +
      `│ ⏱️ *المدة:* ${duration}\n` +
      `│ 👁️ *المشاهدات:* ${views}\n` +
      `│ 📺 *القناة:* ${channel}\n` +
      `│\n` +
      `╰──────────────────• 🐗`;

    await conn.sendMessage(m.chat, {
      document: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
      caption: caption,
      contextInfo: thumbnail ? {
        externalAdReply: {
          title: filename.substring(0, 60),
          body: `⏱️ ${duration} • 📺 ${channel}`,
          thumbnailUrl: thumbnail,
          sourceUrl: sourceUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      } : undefined,
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('Play error:', error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await m.reply(
      `╭─── 「 **حـدث خـطـأ** 」 ───⚔️\n` +
      `│\n` +
      `│ ❌ *وقع خطأ غير متوقع، حاول لاحقاً.*\n` +
      `│ *السبب:* ${error.message}\n` +
      `│\n` +
      `╰──────────────────• 🐗`
    );
  }
};

handler.help = ['play2'];
handler.command = /^(play2|شغل2|صوت2|اغنية2)$/i;
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
