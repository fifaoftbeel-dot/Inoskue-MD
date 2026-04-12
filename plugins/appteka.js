import axios from 'axios';

const appTeka = {
    api: {
        base: 'https://appteka.store',
        endpoint: {
            search: '/api/1/app/search',
            userApps: '/api/1/user/app/list',
            appInfo: '/api/1/app/info',
            userProfile: '/api/2/user/profile'
        }
    },

    headers: {
        'content-type': 'application/json',
        'user-agent': 'Postify/1.0.0'
    },

    utils: {
        formatSize: bytes => {
            if (bytes === 0) return '0 Byte';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            return `${Math.round(bytes / Math.pow(1024, i))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
        },

        formatTime: timestamp => new Date(timestamp * 1000).toLocaleDateString(),

        extractId: (url, type) => {
            const match = url?.match(new RegExp(`/${type}/([^/]+)$`));
            return match?.[1] || null;
        },

        isUrl: (input, type) => {
            if (!input) return { valid: false, error: `⚠️ الـمـدخل فارغ!` };
            if (type === 'search') {
                return input.length < 2 ? { valid: false, error: "⚠️ نـص الـبـحث قـصـير جـداً!" } : { valid: true, query: input };
            }
            const urlType = type === 'info' ? 'app' : type === 'apps' ? 'profile' : type;
            const id = appTeka.utils.extractId(input, urlType);
            return id ? { valid: true, id } : { valid: false, error: `⚠️ الـرابط غـير صـحيح!` };
        },

        res: (response, type) => {
            if (!response?.data || response.status !== 200) {
                return { success: false, code: response?.status || 400, result: { error: "❌ لـم يـتـم الـعـثور عـلـى نـتـائـج!" } };
            }
            return null;
        },

        parse: (data, type) => {
            const types = {
                app: app => ({
                    appId: app.app_id,
                    appName: app.label,
                    package: app.package,
                    version: { name: app.ver_name, code: app.ver_code },
                    stats: { downloads: app.downloads, rating: app.rating },
                    metadata: { size: appTeka.utils.formatSize(app.size), uploadTime: appTeka.utils.formatTime(app.time) },
                    status: { source: `${appTeka.api.base}/app/${app.app_id}` }
                }),
                info: meta => ({
                    appInfo: { size: meta.info.size, label: meta.info.label, package: meta.info.package, version: { name: meta.info.ver_name }, downloads: meta.info.downloads },
                    metadata: { description: meta.meta.description },
                    download: { link: meta.link }
                }),
                profile: profile => ({ userId: profile.user_id, name: profile.name, joinTime: profile.join_time, stats: { totalDownloads: profile.total_downloads, filesCount: profile.files_count }, status: { isVerified: profile.is_verified } })
            };
            return types[type](data);
        }
    },

    request: async (input, type, offset = 0, locale = 'en', count = 20) => {
        try {
            const validation = appTeka.utils.isUrl(input, type);
            if (!validation.valid) return { success: false, result: { error: validation.error } };

            const endpoints = {
                search: { url: appTeka.api.endpoint.search, params: { query: validation.query, offset, locale, count }, parser: data => ({ query: validation.query, total: data.entries?.length || 0, apps: data.entries?.map(app => appTeka.utils.parse(app, 'app')) || [] }) },
                info: { url: appTeka.api.endpoint.appInfo, params: { app_id: validation.id }, parser: data => appTeka.utils.parse(data, 'info') },
                profile: { url: appTeka.api.endpoint.userProfile, params: { user_id: validation.id }, parser: data => appTeka.utils.parse(data.profile, 'profile') },
                apps: { url: appTeka.api.endpoint.userApps, params: { user_id: validation.id, offset, locale, count }, parser: data => ({ total: data.entries?.length || 0, apps: data.entries?.map(app => appTeka.utils.parse(app, 'app')) || [] }) }
            };

            const endpoint = endpoints[type];
            const response = await axios.get(`${appTeka.api.base}${endpoint.url}`, { params: endpoint.params, headers: appTeka.headers, validateStatus: false });
            const error = appTeka.utils.res(response, type);
            if (error) return error;
            return { success: true, result: endpoint.parser(response.data.result) };
        } catch (error) {
            return { success: false, result: { error: "❌ حـدث خـطأ فـي الـخادم!" } };
        }
    }
};

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply(`*『 ⚠️ 』يـرجـى تـحـديد الـنـوع والـمـدخل.*\n\n*📌 مـثـال:*\n.appteka search WhatsApp`);

    const [typeRaw, ...inputParts] = text.trim().split(' ');
    const type = typeRaw.toLowerCase();
    const input = inputParts.join(' ');
    const validTypes = ['search', 'info', 'profile', 'apps'];

    if (!validTypes.includes(type)) return m.reply(`*『 ❌ 』نـوع غـير صـالـح! اسـتـخدم: ${validTypes.join(', ')}*`);
    if (!input) return m.reply(`*『 ⚠️ 』يـرجـى إدخـال الـنـص أو الـرابـط.*`);

    await conn.sendMessage(m.chat, { react: { text: "🔍", key: m.key } });

    try {
        const response = await appTeka.request(input, type);
        if (!response.success) return m.reply(response.result?.error);

        const result = response.result;
        let replyText = '';

        switch (type) {
            case 'search':
                replyText = `*╭───〔 🔱 نـتـائـج الـبـحـث 〕───╼*\n*│*\n*│* 💠 **الـطـلـب:** ${result.query}\n*│* 📊 **الـعـدد:** ${result.total}\n*│*\n`;
                result.apps.forEach(app => {
                    replyText += `*◈ الاسم:* ${app.appName}\n*◈ الحجم:* ${app.metadata.size}\n*◈ الرابط:* ${app.status.source}\n\n`;
                });
                replyText += `*╰────────────────────╼* 🐗`;
                break;

            case 'info':
                let infoCap = `
*╭───〔 🔱 مـعـلـومـات الـتـطـبـيـق 〕───╼*
*│*
*│* 📱 **الاسـم:** ${result.appInfo.label}
*│* 📦 **الـحـزمة:** ${result.appInfo.package}
*│* 🔖 **الإصـدار:** ${result.appInfo.version.name}
*│* 💾 **الـحـجـم:** ${result.appInfo.size}
*│* 📥 **الـتـحـمـيـلات:** ${result.appInfo.downloads}
*│* ⚡ **بـواسطـة:** INOSUKE BOT
*│*
*╰────────────────────╼* 🐗`.trim();
                
                await m.reply(infoCap);
                await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });
                return conn.sendFile(m.chat, result.download.link, `${result.appInfo.label}.apk`, infoCap, m, false, { mimetype: 'application/vnd.android.package-archive', asDocument: true });

            case 'profile':
                replyText = `
*╭───〔 🔱 مـلـف الـمـطـور 〕───╼*
*│*
*│* 👨‍💻 **الاسـم:** ${result.name}
*│* 🆔 **الـمـعرف:** ${result.userId}
*│* 📅 **الانـضـمـام:** ${result.joinTime}
*│* 📥 **الـتـحـمـيـلات:** ${result.stats.totalDownloads}
*│* ✅ **الـحـالة:** ${result.status.isVerified ? 'مـوثـق ✨' : 'غـير مـوثـق'}
*│*
*╰────────────────────╼* 🐗`.trim();
                break;

            case 'apps':
                replyText = `*╭───〔 🔱 تـطـبـيـقـات الـمـسـتـخـدم 〕───╼*\n*│*\n*│* 📊 **الـمـجـموع:** ${result.total}\n*│*\n`;
                result.apps.forEach(app => {
                    replyText += `*◈ الاسم:* ${app.appName}\n*◈ الإصدار:* ${app.version.name}\n*◈ الرابط:* ${app.status.source}\n\n`;
                });
                replyText += `*╰────────────────────╼* 🐗`;
                break;
        }

        if (replyText) {
            await conn.reply(m.chat, replyText, m);
            await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
        }

    } catch (e) {
        await m.reply('*『 ❌ 』حـدث خـطأ داخـلـي.*');
    }
};

handler.help = ['اب تيكا <بحث/معلومات>'];
handler.command = ['appteka', 'اب_تيكا'];
handler.tags = ['downloader'];
handler.limit = true;

export default handler;
list || [],
                    grant_roles: profile.grant_roles || []
                })
            };

            return types[type](data);
        }
    },

    request: async (input, type, offset = 0, locale = 'en', count = 20) => {
        try {
            const validation = appTeka.utils.isUrl(input, type);
            if (!validation.valid) {
                return {
                    success: false,
                    code: 400,
                    result: { error: validation.error }
                };
            }

            const endpoints = {
                search: {
                    url: appTeka.api.endpoint.search,
                    params: { query: validation.query, offset, locale, count },
                    parser: data => ({
                        query: validation.query,
                        params: { offset, locale, count },
                        total: data.entries?.length || 0,
                        apps: data.entries?.map(app => appTeka.utils.parse(app, 'app')) || []
                    })
                },
                info: {
                    url: appTeka.api.endpoint.appInfo,
                    params: { app_id: validation.id },
                    parser: data => appTeka.utils.parse(data, 'info')
                },
                profile: {
                    url: appTeka.api.endpoint.userProfile,
                    params: { user_id: validation.id },
                    parser: data => appTeka.utils.parse(data.profile, 'profile')
                },
                apps: {
                    url: appTeka.api.endpoint.userApps,
                    params: { user_id: validation.id, offset, locale, count },
                    parser: data => ({
                        profile_link: input,
                        params: { userId: validation.id, offset, locale, count },
                        total: data.entries?.length || 0,
                        apps: data.entries?.map(app => appTeka.utils.parse(app, 'app')) || []
                    })
                }
            };

            const endpoint = endpoints[type];
            const response = await axios.get(`${appTeka.api.base}${endpoint.url}`, {
                params: endpoint.params,
                headers: appTeka.headers,
                validateStatus: false
            });

            const error = appTeka.utils.res(response, type);
            if (error) return error;

            return {
                success: true,
                code: 200,
                result: endpoint.parser(response.data.result)
            };

        } catch (error) {
            return {
                success: false,
                code: error?.response?.status || 400,
                result: {
                    error: error?.response?.data?.message || error.message || "Something went wrong! 😐"
                }
            };
        }
    }
};

let handler = async (m, { conn, text }) => {
    if (!text) {
        return conn.reply(m.chat, `Enter the command with the format:\n\n*appteka <type> <input>*\nExamples:\n\n- *appteka search WhatsApp*\n\n- *appteka info https://appteka.store/app/f11r218089*`, m);
    }

    const [typeRaw, ...inputParts] = text.trim().split(' ');
    const type = typeRaw.toLowerCase();
    const input = inputParts.join(' ');

    const validTypes = ['search', 'info', 'profile', 'apps'];
    if (!validTypes.includes(type)) {
        return conn.reply(m.chat, `Invalid type!\nUse one of: *${validTypes.join(', ')}*`, m);
    }

    if (!input) {
        const example = type === 'search' ? 'WhatsApp' : (type === 'info' || type === 'download' || type === 'dl' ? 'https://appteka.store/app/12345' : 'https://appteka.store/profile/67890');
        return conn.reply(m.chat, `Enter an input for type *${type}*\nExample: *appteka ${type} ${example}*`, m);
    }

    try {
        const response = await appTeka.request(input, type);
        if (!response.success) {
            return conn.reply(m.chat, response.result?.error || 'An error occurred while fetching data.', m);
        }

        const result = response.result;
        let replyText = '';

        switch (type) {
            case 'search':
                replyText = `Search results for "${result.query}":\nTotal: ${result.total}\n`;
                result.apps.forEach(app => {
                    replyText += `\n- *${app.appName}* (${app.package})\n  Version: ${app.version.name}\n  Size: ${app.metadata.size}\n  Downloads: ${app.stats.downloads}\n  Link: ${app.status.source}\n`;
                });
                break;

            case 'info':
                return m.reply(`*${result.appInfo.label}*\n` +
                            `*\`Package:\`* ${result.appInfo.package}\n` +
                            `*\`Version:\`* ${result.appInfo.version.name} (Code: ${result.appInfo.version.code})\n` +
                            `*\`Size:\`* ${result.appInfo.size}\n` +
                            `*\`Downloads:\`* ${result.appInfo.downloads}\n` +
                            `*\`Description:\`* ${result.metadata.description?.slice(0, 100)}...\n\n> Application is being sent, please wait...`).then(_ => conn.sendFile(
                    m.chat,
                    result.download.link,
                    `${result.appInfo.package.split('.')[1]}.apk`,
                    `*${result.appInfo.label}*\nVersion: ${result.appInfo.version.name}\nSize: ${result.appInfo.size}`, m, false, { mimetype: 'application/vnd.android.package-archive', asDocument: true}));
                break;

            case 'profile':
                replyText = `*User Profile: ${result.name}*\n` +
                            `ID: ${result.userId}\n` +
                            `Joined: ${result.joinTime}\n` +
                            `Total Downloads: ${result.stats.totalDownloads}\n` +
                            `File Count: ${result.stats.filesCount}\n` +
                            `Status: ${result.status.isVerified ? 'Verified' : 'Not Verified'}\n`;
                break;

            case 'apps':
                replyText = `*Apps from profile*\nLink: ${result.profile_link}\nTotal: ${result.total}\n`;
                result.apps.forEach(app => {
                    replyText += `\n- *${app.appName}* (${app.package})\n  Version: ${app.version.name}\n  Size: ${app.metadata.size}\n  Downloads: ${app.stats.downloads}\n  Link: ${app.status.source}\n`;
                });
                break;
        }

        if (replyText) {
            await conn.reply(m.chat, replyText.trim(), m);
        }

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, 'An internal error occurred.', m);
    }
};

handler.help = ['appteka'];
handler.command = ['appteka'];
handler.tags = ['downloader'];
handler.limit = true;
export default handler;
