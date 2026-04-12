import axios from 'axios';
import cheerio from 'cheerio';

const fsaver = {
    download: async (url) => {
        const fetchUrl = `https://fsaver.net/download/?url=${url}`;
        const headers = {
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        };
        try {
            const response = await axios.get(fetchUrl, { headers });
            const html = response.data;
            const data = await fsaver.getData(html);
            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    getData: async (content) => {
        try {
            const baseUrl = 'https://fsaver.net';
            const $ = cheerio.load(content);
            const videoSrc = $('.video__item').attr('src');
            if (!videoSrc) throw new Error('ERR');
            return { video: baseUrl + videoSrc };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

const handler = async (m, { conn, args }) => {
    if (!args[0]) throw `*『 ⚠️ 』يـرجـى إرسـال رابـط فـيـديـو فـيـسـبـوك صـحـيـح.*\n\n*📌 مـثـال:*\n.فيس [الرابط]`;
    
    const url = args[0];
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    try {
        const result = await fsaver.download(url);

        if (!result || result.success === false) {
            throw new Error(`ERR`);
        }

        const { video } = result;

        let caption = `
*╭───〔 🔱 تـحـمـيـل فـيـسـبـوك 〕───╼*
*│*
*│* ✨ **تـم جـلـب الـفـيـديـو بـنـجـاح**
*│* ⚡ **بـواسطـة:** INOSUKE BOT
*│*
*╰────────────────────╼* 🐗`.trim();

        await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

        await conn.sendMessage(
            m.chat, {
                video: { url: video },
                caption: caption,
                mimetype: 'video/mp4',
                fileName: 'fb_video.mp4'
            }, { quoted: m }
        );

        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (error) {
        m.reply(`*『 ❌ 』عـذراً، فـشـل تـحـمـيـل الـفـيـديـو.*`);
    }
};

handler.help = ['فيس <رابط>'];
handler.command = /^(facebookdl|فيس|فيسبوك)$/i;
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
