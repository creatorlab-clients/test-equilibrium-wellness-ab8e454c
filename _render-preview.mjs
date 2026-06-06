import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = __dirname;

const config = JSON.parse(fs.readFileSync(path.join(dir, 'template.config.json'), 'utf8'));
const template = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');

// Build context from slot defaults
const ctx = {};
for (const [key, slot] of Object.entries(config.slots)) {
  if (slot.default !== undefined) {
    ctx[key] = slot.default;
  }
}

// Compile and render HTML
const compiled = Handlebars.compile(template, { strict: false });
let html = compiled(ctx);

// Process script.js: simple string replacement for frameBaseUrl (can't use Handlebars — JS file contains literal {{ chars)
const scriptSrc = fs.readFileSync(path.join(dir, 'script.js'), 'utf8');
const scriptProcessed = scriptSrc.replace(/\{\{frameBaseUrl\}\}/g, ctx.frameBaseUrl);

// Replace <script src="script.js"> with inline processed script
html = html.replace(
  /<script src="script\.js"><\/script>/,
  `<script>\n${scriptProcessed}\n</script>`
);

fs.writeFileSync(path.join(dir, 'index-preview.html'), html, 'utf8');
console.log('Preview generata: template-fitness-003/index-preview.html');
