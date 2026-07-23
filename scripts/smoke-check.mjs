import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredIds = [
    'mainCanvas',
    'imageUpload',
    'layerUpload',
    'overlayText',
    'drawSize',
    'textSize',
    'fitMode',
    'imageStatus',
    'loadingIndicator',
    'publishStatus'
];

const dynamicIds = new Set(['thinking']);
const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
const referencedIds = [...new Set([...html.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(match => match[1]))];
const handlerRefs = [...new Set([...html.matchAll(/on(?:click|change|submit|input)="([A-Za-z0-9_]+)\(/g)].map(match => match[1]))];
const handlerDefs = new Set([...html.matchAll(/function\s+([A-Za-z0-9_]+)\s*\(/g)].map(match => match[1]));

const errors = [];

for (const id of requiredIds) {
    if (!ids.has(id)) errors.push(`Required element id missing: ${id}`);
}

for (const id of referencedIds) {
    if (!ids.has(id) && !dynamicIds.has(id)) {
        errors.push(`Referenced id missing from markup: ${id}`);
    }
}

for (const handler of handlerRefs) {
    if (!handlerDefs.has(handler)) {
        errors.push(`Inline handler is undefined: ${handler}`);
    }
}

if (!html.includes("renderCanvas();")) {
    errors.push('Expected renderCanvas() call is missing.');
}

if (errors.length > 0) {
    console.error('Static smoke check failed:');
    errors.forEach(err => console.error(`- ${err}`));
    process.exit(1);
}

console.log('Static smoke check passed.');
