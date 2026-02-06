import { build } from 'esbuild';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const entryFile = path.join(__dirname, 'src', 'index.ts');
const assetsSrc = path.join(__dirname, 'src', 'assets');
const assetsDest = path.join(distDir, 'assets');

await build({
  entryPoints: [entryFile],
  outfile: path.join(distDir, 'index.js'),
  bundle: true,
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  minify: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  sourcemap: true,
  tsconfig: path.join(__dirname, 'tsconfig.json'),
  logLevel: 'info',
});

if (existsSync(assetsSrc)) {
  mkdirSync(distDir, { recursive: true });
  cpSync(assetsSrc, assetsDest, { recursive: true });
}
