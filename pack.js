/*
This script generates Firefox version of the extension and packs Chrome and Firefox versions to zip files.
Node.js v16.6.1 recommended.
*/

const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function copyDir(src, dest) {
    const entries = await fsp.readdir(src, { withFileTypes: true });
    await fsp.mkdir(dest);
    for (let entry of entries) {
        if(entry.name === '.git' || entry.name === '.github' || entry.name === '_metadata') continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fsp.copyFile(srcPath, destPath);
        }
    }
}

if(fs.existsSync('../CobaltExtTempChrome')) {
    fs.rmSync('../CobaltExtTempChrome', { recursive: true });
}
if(fs.existsSync('../CobaltExtFirefox')) {
    fs.rmSync('../CobaltExtFirefox', { recursive: true });
}

console.log("Copying...");
copyDir('./', '../CobaltExtFirefox').then(async () => {
    await copyDir('./', '../CobaltExtTempChrome');
    console.log("Copied!");
    console.log("Patching...");

    let manifest = JSON.parse(await fsp.readFile('../CobaltExtTempChrome/manifest.json', 'utf8'));
    manifest.background = {};
    manifest.background.scripts = ['background.js'];
    manifest.browser_specific_settings = {
        gecko: {
            id: "cobalt@dimden.dev",
            strict_min_version: "101.0"
        }
    };
    delete manifest.background.service_worker;
    delete manifest.content_scripts;

    let scripts = ["content_script.js", "options.js", "background.js"];
    for(let script of scripts) {
        let data = await fsp.readFile(`../CobaltExtFirefox/${script}`, 'utf8');
        data = data.replace(/chrome\.storage\.sync\./g, "chrome.storage.local.");

        if(script === "options.js") {
            data = data.replace("const auto = document.getElementById('auto').checked;", "").replace(", auto: true", "").replace(", auto", "").replace("document.getElementById('auto').checked = items.auto;", "");
        }

        await fsp.writeFile(`../CobaltExtFirefox/${script}`, data);
    }

    let options_html = await fsp.readFile('../CobaltExtFirefox/options.html', 'utf8');
    options_html = options_html.replace('press on save button automatically: <input type="checkbox" id="auto" style="vertical-align:sub"><br><br>', "");

    fs.writeFileSync('../CobaltExtFirefox/manifest.json', JSON.stringify(manifest, null, 2));
    fs.writeFileSync('../CobaltExtFirefox/options.html', options_html);
    fs.unlinkSync('../CobaltExtFirefox/pack.js');
    fs.unlinkSync('../CobaltExtFirefox/content_script.js');
    fs.unlinkSync('../CobaltExtTempChrome/pack.js');

    console.log("Patched!");
    if (fs.existsSync('../CobaltExtFirefox.zip')) {
        console.log("Deleting old zip...");
        fs.unlinkSync('../CobaltExtFirefox.zip');
        console.log("Deleted old zip!");
    }
    console.log("Zipping Firefox version...");
    try {
        const zip = new AdmZip();
        const outputDir = "../CobaltExtFirefox.zip";
        zip.addLocalFolder("../CobaltExtFirefox");
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`Something went wrong ${e}`);
    }
    console.log("Zipping Chrome version...");
    try {
        const zip = new AdmZip();
        const outputDir = "../CobaltExtChrome.zip";
        zip.addLocalFolder("../CobaltExtTempChrome");
        zip.writeZip(outputDir);
    } catch (e) {
        console.log(`Something went wrong ${e}`);
    }
    console.log("Zipped!");
    console.log("Deleting temporary folders...");
    fs.rmSync('../CobaltExtTempChrome', { recursive: true });
    fs.rmSync('../CobaltExtFirefox', { recursive: true });
    console.log("Deleted!");
});