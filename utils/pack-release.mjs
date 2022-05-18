import AdmZip from 'adm-zip';
import {exec} from "child_process";
import * as fs from "fs";

const dir = '.packs';
const manifests = {
    beta:    'manifest-beta.json',
    release: 'manifest.json'
};

const type = process.argv[2] ?? 'beta';

(async () => {
    try {
        if (!manifests[type]) {
            throw new Error(`Type must be one of ${Object.keys(manifests).join(',')}, got ${type}`);
        }

        await new Promise(r => exec('npm run build', r));

        const { id, version } = JSON.parse(fs.readFileSync(manifests[type], 'utf8'));
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const zip = new AdmZip();
        zip.addLocalFile(manifests[type]);
        zip.addLocalFile('main.js');
        zip.writeZip(`${dir}/${id}-${version}.zip`);
    } catch (e) {
        console.error(e.message);
    }
})();