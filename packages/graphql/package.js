import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, './package.json');

export default JSON.parse(readFileSync(file));
