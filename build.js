const fs = require('fs');
const path = require('path');
const util = require('util');
const Ajv = require('ajv/dist/2020');
const crypto = require('crypto');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const ROOT = './src/';
const SCHEMA_PATH = './schema.json';
const DIST_DIR = 'dist';
const DIST_FILE = 'Payloads.js';

function encodeUnicode(str) {
    return Array.from(str).map(char => {
        if (char.charCodeAt(0) < 128) return char;
        return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
    }).join('');
}

function generateId(prefix, payload, suffix) {
    const hash = crypto.createHash('sha1');
    hash.update(`${prefix}${payload}${suffix}`);
    return hash.digest('hex');
}

async function validateWordlist(schemaValidator, filePath) {
    const content = await readFile(filePath, 'utf8');
    const wordlist = JSON.parse(content);
    if (!schemaValidator(wordlist)) {
        throw new Error(`Validation failed for ${filePath}:\n${JSON.stringify(schemaValidator.errors, null, 2)}`);
    }
    return wordlist;
}

function checkUniqueIds(wordlists) {
    const idCounts = wordlists.flatMap(wl => wl.payloads).reduce((acc, { id }) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
    }, {});

    const nonUniqueIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
    if (nonUniqueIds.length > 0) {
        throw new Error(`Non-unique IDs found: ${nonUniqueIds.join(', ')}`);
    }
}

async function aggregateJson() {
    const ajv = new Ajv({ strict: false });
    const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, SCHEMA_PATH), 'utf-8'));
    const validate = ajv.compile(schema);
    
    const payloadsDir = path.resolve(__dirname, ROOT);
    const files = await readdir(payloadsDir);
    let wordlists = [];

    for (const file of files.filter(f => f.endsWith('.json'))) {
        const filePath = path.join(payloadsDir, file);
        const wordlist = await validateWordlist(validate, filePath);
        
        wordlist.payloads.forEach(element => {
            if (!element.id) {
                element.id = generateId(element.prefix, element.payload, element.suffix);
            }
        });

        wordlists.push(wordlist);
    }

    checkUniqueIds(wordlists);
    
    const output = `export const PAYLOADS = ${encodeUnicode(JSON.stringify(wordlists, null, 2))};`;
    const distPath = path.join(__dirname, DIST_DIR);
    if (!fs.existsSync(distPath)) {
        fs.mkdirSync(distPath, { recursive: true });
    }
    await writeFile(path.join(distPath, DIST_FILE), output);
    console.log(`Aggregated JSON files into ${path.join(distPath, DIST_FILE)}`);
}

aggregateJson().catch(err => {
    console.error('Failed to aggregate JSON files:', err);
    process.exit(1);
});
