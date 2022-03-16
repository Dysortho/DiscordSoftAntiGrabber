const { readdirSync, writeFile, rename, existsSync, readFileSync, appendFileSync } = require('fs');
const { exec } = require('child_process');
const LOCALAPPDATA = process.env.LOCALAPPDATA ? __dirname.split(':')[0] + ':\\Users\\' + __dirname.split('\\')[2] + '\\AppData\\Local' : process.env.LOCALAPPDATA;

function main() {
    console.clear()
    console.log('\n\n\x1b[36m   Vos discords vont être redémarrés. Êtes-vous sûrs de vouloir continuer ? (y/n)\x1b[0m');
    process.stdin.on('data', (reponse) => {
        if (reponse.toString().trim().toLowerCase() === 'n') return console.clear(), console.log('\x1b[31mAnnulé, au revoir!\x1b[0m'), process.exit(0);
        else if (!reponse.toString().trim()) return console.log('\x1b[31mVous devez répondre par \x1b[0m\x1b[41my\x1b[0m\x1b[31m ou \x1b[0m\x1b[41mn\x1b[0m\x1b[31m!\x1b[0m'), process.exit(0);
        else if (reponse.toString().trim().toLowerCase() === 'y') start();
    })
}
function startDiscord(name, new_path) {
    exec(`${new_path}\\Update.exe --processStart ${name}.exe`, (err, stdout, stderr) => {
        if (err) console.log(err);
        else console.log(`\x1b[32mProcess started!\x1b[0m (${name})`);
    })
}

function start() {
    readdirSync(LOCALAPPDATA).forEach(async (folder) => {
        var newName = randomName();
        if (folder.toLowerCase().startsWith('discord')) {
            console.log(`\x1b[32mDiscord found!\x1b[0m ${LOCALAPPDATA}\\${folder}`);
            edit_core_file(LOCALAPPDATA + '\\' + folder, folder);
            killDiscord(folder);
            await setNewName(folder, LOCALAPPDATA + '\\' + folder, LOCALAPPDATA + '\\' + newName);
        } else if (folder.toLowerCase().startsWith('discord') === null) console.log(`\x1b[31mAucun Discord trouvé.\x1b[0m`);
    })
}

async function setNewName(name, path, new_path) {
    if (!existsSync(path)) return console.log(`\x1b[31mLe chemin de ${name} n'est pas trouvé.\x1b[0m`);
    else {
        await rename(path, new_path, function (err) {
            if (err) return;
            else console.log(`\x1b[32m${name} a bien été renommé.\x1b[0m`);
        });
        await startDiscord(name, new_path);
    }
}

function killDiscord(process) {
    exec(`taskkill /f /im ${process}.exe`, (err, stdout, stderr) => {
        if (err) return;
        else if (stdout) console.log(`\x1b[32mProcess killed !\x1b[0m(${process})`);
    })
}


function randomName() {
    var length = Math.round(Math.random() * (32 - 9) + 9)
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
    newName = "";
    for (var i = 0; i < length; i++) {
        newName += chars[Math.floor(Math.random() * chars.length)];
    }
    return newName;
}


function edit_core_file(path, name) {
    var corePath = [];
    var isInfected;
    var appRegex = /app-1.[0-9].[0-9]*/;
    var desktop_coreRegex = /[0-9]/;

    console.log('\x1b[32mChecking started...\x1b[0m');
    readdirSync(path).forEach(appFolder => {
        if (appFolder.match(appRegex)) {
            readdirSync(path + '\\' + appFolder + '\\modules\\').forEach(deskcoreFolder => {
                if (deskcoreFolder.includes('desktop') && deskcoreFolder.match(desktop_coreRegex)) {
                    var file_content = readFileSync(path + '\\' + appFolder + '\\modules\\' + deskcoreFolder + '\\discord_desktop_core\\index.js', 'utf-8');
                    if (file_content !== 'module.exports = require(\'./core.asar\');') appendFileSync(`./extras/core_${name}_index.js`, file_content), isInfected = true;
                    corePath.push(path + '\\' + appFolder + '\\modules\\' + deskcoreFolder + '\\discord_desktop_core\\index.js');
                }
            })
        }
    })

    if (isInfected) {
        writeFile(corePath[0], 'module.exports = require(\'./core.asar\');', 'utf-8', err => {
            if (err) return;
            else console.log(`\x1b[32mCore file edited !\x1b[0m\n\x1b[33mVous avez probablement été infecté dans ${corePath[0]} !\nUn fichier a été créé avec le contenu du fichier.\x1b[0m`);
        })
    }

}

main()
