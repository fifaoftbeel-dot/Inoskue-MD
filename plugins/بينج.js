import speed from "performance-now";
import { spawn, exec, execSync } from "child_process";

let handler = async (m, { conn }) => {
  let timestamp = speed();
  let latensi = speed() - timestamp;
  
  exec(`neofetch --stdout`, (error, stdout, stderr) => {
    let child = stdout.toString("utf-8");
    let ssd = child.replace(/Memory:/, "💎 الـرام:");
    
    let response = `
*╭───〔 🔱 حـالـة الـنـظـام 〕───╼*
*│*
${ssd.trim()}
*│*
*│* 💠 *الاسـتـجـابـة :* ${latensi.toFixed(4)} MS
*│* ⚡ *الـحـالـة :* مـتـصـل للـسـيـطـرة
*│*
*╰────────────────────╼* 🐗`.trim();

    m.reply(response);
  });
};

handler.help = ["سرعة"];
handler.tags = ["tools"];
handler.command = ["ping", "speed", "بينج", "سرعة"];

export default handler;
