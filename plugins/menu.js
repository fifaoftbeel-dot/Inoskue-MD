import moment from 'moment-timezone'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    const cmd = args[0] || 'list';
    let type = (args[0] || '').toLowerCase()
    
    let d = new Date(new Date + 3600000)
    let locale = 'ar'
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let time = moment.tz('Africa/Casablanca').format('HH:mm:ss')

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
        header: `◈═══〔 ${key.toUpperCase()} 〕═══◈`,
        title: `⚡ استعراض ميزات [ ${key} ]`,
        description: `عدد الأوامر : ${value}`,
        id: usedPrefix + "menu1 " + key,
    }));

    const datas = {
        title: "⚡ إضغط هنا للدخول إلى القائمة ⚡",
        sections: [
            {
                title: "👑 الـقـسـم الـمـلـكـي",
                highlight_label: "PREMIUM",
                rows: [{
                    header: "◈═══〔 GLOBAL MENU 〕═══◈",
                    title: "💎 كافة أوامر البوت",
                    description: "عرض شامل لكل ميزات إينوسكي",
                    id: usedPrefix + "menu1 all",
                }],
            },
            {
                title: "📂 أقـسـام الـعـظـمـة",
                highlight_label: "OFFICIAL",
                rows: [...isiMenu]
            },
            {
                title: "🚀 الـتـطـويـر والـسـرعـة",
                rows: [
                    { header: "OWNER", title: "مـطـور الـنـظـام", description: "مصطفى - المغرب 🇲🇦", id: usedPrefix + "owner" },
                    { header: "PING", title: "حـالـة الإتـصـال", description: "فحص سرعة الاستجابة", id: usedPrefix + "ping" }
                ]
            }
        ]
    };

    let headers = `⚔️ *｢ ＩＮＯＳＵＫＥ - ＢＯＴ ｣* ⚔️\n` +
                  `*『 🕯️ 』━━━━━━━━━━━━━━━━━━━━* \n` +
                  `*🐗 أهلاً بك في عالمك الجديد.. أنا رفيقك الذي سيجعل لتطبيق الواتساب هيبة وطعماً آخر بلمسات إينوسكي القوية 🔥*\n\n` +
                  `*📅 التاريخ :* ${date}\n` +
                  `*⏰ الوقت الآن :* ${time}\n` +
                  `*📊 إجمالي الطلبات :* ${Object.values(global.db.data.stats).reduce((total, stat) => total + stat.success, 0)}\n` +
                  `*『 🕯️ 』━━━━━━━━━━━━━━━━━━━━*`

    if (cmd === 'list') {
        const more = String.fromCharCode(8206)
        const readMore = more.repeat(4001)
        let name = conn.getName(m.sender)
        let listText = `${headers}${readMore}\n\n*✨ يا ${name}.. اختر وجهتك من الزر بالأسفل لتنطلق 🛡️*`

        await conn.sendListImageButton(m.chat, listText, datas, '© 2026 INOSUKE BOT | MUSTAFA 🇲🇦', thumbnail)

    } else if (tagCount[cmd]) {
        const daftarHelp = tagHelpMapping[cmd].map((helpItem) => `*│* 💠 ${usedPrefix}${helpItem}`).join('\n');
        const list2 = `${headers}\n\n*┏━━〔 ${cmd.toUpperCase()} 〕━━┓*\n${daftarHelp}\n*┗━━━━━━━━━━━━━━┛*\n\n*🛡️ عدد الميزات : ${tagHelpMapping[cmd].length}*`
        await conn.reply(m.chat, list2, m)

    } else if (cmd === 'all') {
        const allTagsAndHelp = Object.keys(tagCount).map(tag => {
            const daftarHelp = tagHelpMapping[tag].map(helpItem => `*│* 💠 ${usedPrefix}${helpItem}`).join('\n');
            return `*┏━━〔 ${tag.toUpperCase()} 〕━━┓*\n${daftarHelp}\n*┗━━━━━━━━━━━━━━┛*`;
        }).join('\n\n');
        await conn.reply(m.chat, `${headers}\n\n${allTagsAndHelp}`, m)
    } else {
        await conn.reply(m.chat, `⚠️ عفواً يا بطل، القسم '${cmd}' غير موجود حالياً.`, m);
    }
}

handler.help = ['menu1']
handler.command = ['menu1']
handler.register = false

export default handler
  
