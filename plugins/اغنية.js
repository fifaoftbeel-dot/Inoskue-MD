let handler = async (m, { conn, text, usedPrefix, command }) => {

  try {
    const query = text ? text.trim() : '';

    if (!query) {
      return m.reply(
        `*『 ⚠️ 』يـرجـى كـتـابـة اسـم الـمـقـطـع أو الـرابـط.*\n\n*📌 مـثـال:*\n${usedPrefix + command} سورة البقرة`
      );
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    if (query.length > 100) {
      return m.reply(`*『 ⚠️ 』الـطـلـب طـويـل جـداً! الـحـد الأقـصـى 100 حـرف.*`);
    }

    const response = await fetch(`https://api.nexray.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.status || !data.result?.download_url) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      return m.reply(`*『 ❌ 』عـذراً، لـم أجـد نـتـائـج لـلـبـحـث عـن:* "${query}"`);
    }

    const result = data.result;
    const audioUrl = result.download_url;
    const filename = result.title || 'صوت غير معروف';
    const thumbnail = result.thumbnail || '';
    const sourceUrl = result.url || '';
    const duration = result.duration || '';
    const views = result.views || '';
    const channel = result.channel || '';

    await conn.sendMessage(m.chat, { react: { text: '📥', key: m.key } });

    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${filename}.mp3`,
      contextInfo: thumbnail ? {
        externalAdReply: {
          title: `💎 ${filename.substring(0, 30)} 💎`,
          body: `ɪɴᴏsᴜᴋᴇ sʏsᴛᴇᴍ • ${duration} • ${views}`,
          thumbnailUrl: thumbnail,
          sourceUrl: sourceUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
        },
      } : undefined,
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      document: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
      caption:
        `*╭───〔 🔱 تـم الـتـحـمـيـل بـنـجـاح 〕───╼*\n` +
        `*│*\n` +
        `*│* 💠 **الاسـم:** ${filename}\n` +
        `*│* ⏱️ **الـمدة:** ${duration}\n` +
        `*│* 👁️ **الـمشاهـدات:** ${views}\n` +
        `*│* 📺 **الـقـناة:** ${channel}\n` +
        `*│* ⚡ **بـواسطـة:** INOSUKE BOT\n` +
        `*│*\n` +
        `*╰────────────────────╼* 🐗`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await m.reply(`*『 ❌ 』حـدث خـطأ غـيـر مـتـوقـع أثـنـاء الـتـشـغـيـل.*`);
  }
};

handler.help = ['تشغيل <نص>'];
handler.command = /^(play|شغل|صوت|اغنية)$/i;
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
   `│\n` +
        `│ ✅ **استمتع بالاستماع!**\n` +
        `╰──────────────────• 🐗`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error('Play error:', error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    await m.reply(
      `╭─── 「 **حـدث خـطـأ** 」 ───⚔️\n` +
      `│\n` +
      `│ ❌ *وقع خطأ غير متوقع، حاول لاحقاً.*\n` +
      `│ **السبب:** ${error.message}\n` +
      `│\n` +
      `╰──────────────────• 🐗`
    );
  }
};

handler.help = ['play'];
handler.command = /^(play|شغل|صوت|اغنية)$/i;
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
