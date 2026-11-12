import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const indexPath = path.join(root, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// 1. Ensure index.html references /src/main.jsx for Vite build
indexHtml = indexHtml.replace(/<script type="module" crossorigin src="\.\/assets\/.*?\.js"><\/script>\s*/g, '');
indexHtml = indexHtml.replace(/<link rel="stylesheet" crossorigin href="\.\/assets\/.*?\.css">\s*/g, '');
if (!indexHtml.includes('/src/main.jsx')) {
  indexHtml = indexHtml.replace('</body>', '    <script type="module" src="/src/main.jsx"></script>\n  </body>');
}
fs.writeFileSync(indexPath, indexHtml);

// 2. Run Vite build
console.log('Building with Vite...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

// 3. Sync dist to root for GitHub Pages
const distDir = path.join(root, 'dist');
const distAssets = path.join(distDir, 'assets');
const rootAssets = path.join(root, 'assets');

if (!fs.existsSync(rootAssets)) fs.mkdirSync(rootAssets, { recursive: true });

// Clean old bundles in assets
for (const file of fs.readdirSync(rootAssets)) {
  fs.unlinkSync(path.join(rootAssets, file));
}

// Copy new assets
for (const file of fs.readdirSync(distAssets)) {
  fs.copyFileSync(path.join(distAssets, file), path.join(rootAssets, file));
}

// Copy dist/index.html to root index.html and 404.html
const distHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
fs.writeFileSync(indexPath, distHtml);
fs.writeFileSync(path.join(root, '404.html'), distHtml);

console.log('Build and GitHub Pages sync completed successfully!');
