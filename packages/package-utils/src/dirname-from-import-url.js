import { dirname } from 'path';
import { fileURLToPath } from 'url';

export function dirnameFromImportUrl(url) {
  return dirname(fileURLToPath(url));
}
