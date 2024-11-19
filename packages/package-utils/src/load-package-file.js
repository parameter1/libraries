import { readFileSync } from 'fs';
import { resolve } from 'path';
import { dirnameFromImportUrl } from './dirname-from-import-url.js';

export function loadPackageFile(importUrl, relativePackagePath) {
  const __dirname = dirnameFromImportUrl(importUrl);
  const file = resolve(__dirname, relativePackagePath);
  return JSON.parse(readFileSync(file));
}
