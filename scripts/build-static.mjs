import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(projectRoot, 'youtube-scraper-extension');
const outputDir = resolve(projectRoot, 'dist/cloudflare');

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(sourceDir, outputDir, { recursive: true });

await writeFile(
  resolve(outputDir, 'index.html'),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0; url=./popup.html">
    <meta name="robots" content="noindex">
    <title>YouTube Channel Scraper</title>
  </head>
  <body>
    <p>Opening the existing Chrome extension popup artifact…</p>
    <p><a href="./popup.html">Open popup.html</a></p>
  </body>
</html>
`,
  'utf8',
);
