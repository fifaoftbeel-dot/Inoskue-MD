import moment from 'moment-timezone'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    const cmd = args[0] || 'list';
    let type = (args[0] || '').toLowerCase()
    
    // إعدادات الوقت والتاريخ بتوقيت المغرب
    let d = new Date(new Date + 3600000)
    let locale = 'ar'
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let time = moment.tz('Africa/Casablanca').format('HH:mm:ss')

    // منطق استخراج الأوامر
    const tagCount = {};
    const tagHelpMapping = {};
    Object.keys(global.plugins)
        .filter(plugin => !plugin.disabled)
        .forEach(plugin => {
            const tagsArray = Array.isArray(global.plugins[plugin].tags) ? global.plugins[plugin].tags : [];
            if (tagsArray.length > 0) {
                const helpArray = Array.isArray(global.plugins[plugin].help) ? global.plugins[plugin].help : [global.plugins[plugin].help];
                tagsArray.forEach(tag => {
                    if (tag) {
                        if (tagCount[tag]) {
                            tagCount[tag]++;
                            tagHelpMapping[tag].push(...helpArray);
                        } else {
                            tagCount[tag] = 1;
                            tagHelpMapping[tag] = [...helpArray];
                        }
                    }
                });
            }
        });

    let isiMenu = []
    Object.entries(tagCount).map(([key, value]) => isiMenu.push({
        header: `✨ قـسـم : ${key.toUpperCase()}`,
        title: `⚡ إظهار قائمة [ ${key} ]`,
        description: `يحتوي على ${value} ميزة فخمة`,
        id: usedPrefix + "menu1 " + key,
    }));

    const datas = {
        title: "إضـغـط هـنـا لـلـقـائـمـة ⚡",
        sections: [
            {
                title: "👑 الـقـائـمـة الـشـامـلـة",
                highlight_label: "HOT",
                rows: [{
                    header: "ALL COMMANDS",
                    title: "💎 عرض جميع الميزات",
                    description: "كل ما يحتاجه إينوسكي في مكان واحد",
                    id: usedPrefix + "menu1 all",
                }],
            },
            {
                title: "📂 تـصـنـيـفـات الـهـيـبـة",
                highlight_label: "NEW",
                rows: [...isiMenu]
            },
            {
                title: "🚀 الـدعم والـتـطـويـر",
                rows: [
                    { header: "OWNER", title: "مـطـور الـبـوت (مصطفى)", description: "تواصل مع المطور مباشرة", id: usedPrefix + "owner" },
                    { header: "SPEED", title: "سـرعـة الإسـتـجـابـة", description: "", id: usedPrefix + "ping" }
                ]
            }
        ]
    };

    // نص ترحيبي فخم جديد بدون "عزوتك" وحذف المنصة
    let headers = `🛡️ *｢ INOSUKE - BOT ｣* 🛡️\n` +
                  `*━━━━━━━━━━━━━━━━━━━*\n` +
                  `*🐗 أهلاً بك في عالم العظمة.. أنا رفيقك الذي سيجعل لتطبيق الواتساب هيبة وطعماً آخر بلمسات إينوسكي القوية ⚔️🔥*\n\n` +
                  `*📅 الـتـاريـخ :* ${date}\n` +
                  `*⏰ الـوقـت الآن :* ${time}\n` +
                  `*📊 إجـمـالـي الـهـجـمـات :* ${Object.values(global.db.data.stats).reduce((total, stat) => total + stat.success, 0)}\n` +
                  `*━━━━━━━━━━━━━━━━━━━*`

    if (cmd === 'list') {
        const more = String.fromCharCode(8206)
        const readMore = more.repeat(4001)
        let name = conn.getName(m.sender)
        let listText = `${headers}${readMore}\n\n*✨ يـا ${name}.. أنـر بـصـيـرتـك وإخـتـر وجـهـتـك مـن الزر الأسـفـل 🛡️*`

        await conn.sendListImageButton(m.chat, listText, datas, '© 2026 INOSUKE BOT | MUSTAFA 🇲🇦', thumbnail)

    } else if (tagCount[cmd]) {
        const daftarHelp = tagHelpMapping[cmd].map((helpItem) => `│ ✧ ${usedPrefix}${helpItem}`).join('\n');
        const list2 = `${headers}\n\n*╭───〔 ${cmd.toUpperCase()} 〕───╼*\n${daftarHelp}\n*╰──────────────╼*\n\n*💎 الـمـيـزات : ${tagHelpMapping[cmd].length}*`
        await conn.reply(m.chat, list2, m)

    } else if (cmd === 'all') {
        const allTagsAndHelp = Object.keys(tagCount).map(tag => {
            const daftarHelp = tagHelpMapping[tag].map(helpItem => `│ ✧ ${usedPrefix}${helpItem}`).join('\n');
            return `*╭───〔 ${tag.toUpperCase()} 〕───╼*\n${daftarHelp}\n*╰──────────────╼*`;
        }).join('\n\n');
        await conn.reply(m.chat, `${headers}\n\n${allTagsAndHelp}`, m)
    } else {
        await conn.reply(m.chat, `⚠️ القسم '${cmd}' غير موجود يا بطل.`, m);
    }
}

handler.help = ['menu1']
handler.command = ['menu1']
handler.register = false

export default handler