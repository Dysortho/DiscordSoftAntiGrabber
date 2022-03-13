const { readdirSync, rename, existsSync} = require('fs');
const { exec } = require('child_process');

var renamed = [];

function main() {
    console.clear()
    console.log('\x1b[36mVos raccourcis ne fonctionneront plus et vos discords vont être redémarrés. Êtes-vous sûrs de vouloir continuer ? (y/n)\x1b[0m');
    process.stdin.on('data', async (reponse) => {
        if (reponse.toString().trim().toLowerCase() === 'n') return console.clear(), console.log('\x1b[31mAnnulé, au revoir!\x1b[0m'), process.exit(0);
        else if (!reponse.toString().trim()) return console.log('\x1b[31mVous devez répondre par \x1b[0m\x1b[41my\x1b[0m\x1b[31m ou \x1b[0m\x1b[41mn\x1b[0m\x1b[31m!\x1b[0m'), process.exit(0);
        else if (reponse.toString().trim().toLowerCase() === 'y') renameFolder();
    })
}

async function renameFolder() {
    killDiscord();
    readdirSync(process.env.LOCALAPPDATA).forEach(async (folder) => {
        var newName = randomName(Math.round(Math.random() * (32 - 9) + 9));
        if (folder.includes("Discord")) {
            edit_core_file(process.env.LOCALAPPDATA + "\\" + folder);
            if(!existsSync(process.env.LOCALAPPDATA + "\\" + folder)) return console.log(`\x1b[31mAucun dossiers discord n'existe! Vous les avez déjà renomé ou n'avez pas de discord d'installé.\x1b[0m`);
            renamed.push(newName);
            await rename(process.env.LOCALAPPDATA + "\\" + folder, process.env.LOCALAPPDATA + "\\" + newName, function (err) {
                if (err) return
            });
        }
    })
    await console.log("\x1b[32mDiscord(s) Renamed!\nStarting Discord(s)...\x1b[0m"), startDiscord()
}

function killDiscord() {
    ["DiscordCanary.exe", "DiscordDevelopment.exe", "Discord.exe", "DiscordPTB.exe"].forEach((process) => {
        exec(`taskkill /f /im ${process}`, (err, stdout, stderr) => {
            if (err) return;
        })
    })
}

function startDiscord() {// cette partie est à refaire
    //C:\Users\User\AppData\Local\DiscordPTB\Update.exe --processStart DiscordPTB.exe
    renamed.forEach((discord) => {
        readdirSync(process.env.LOCALAPPDATA + `\\${discord}`).forEach(file => {
            if (file.endsWith('.log')) {
                if (file.split("_")[0].includes("Discord")) {
                    exec(`${process.env.LOCALAPPDATA}\\${discord}\\Update.exe --processStart ${file.split("_")[0]}.exe`, (err, stdout, stderr) => {
                        if (err) return;
                    })
                }
            }
        })
    })
    process.exit(0)
}

function edit_core_file(path) {
    var corePath = [];
    var appRegex = /app-[0-9].[0-9].[0-9]*/
    var desktop_coreRegex = /[0-9]/

    fs.readdirSync(path).forEach(appFolder => {
        if (appFolder.match(appRegex)) {
            fs.readdirSync(path + "\\" + appFolder + "\\modules\\").forEach(deskcoreFolder => {
                if (deskcoreFolder.includes("desktop") && deskcoreFolder.match(desktop_coreRegex)) {
                    corePath.push(path + "\\" + appFolder + "\\modules\\" + deskcoreFolder + "\\discord_desktop_core\\index.js")
                }
            })
        }
    })
    fs.writeFile(corePath[0], "module.exports = require('./core.asar');", "utf-8", err => {
        if (err) return
    })
}

function randomName(size) {
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    newName = "";
    for (var i = 0; i < size; i++) {
        newName += chars[Math.floor(Math.random() * chars.length)];
    }
    return newName;
}

main()
