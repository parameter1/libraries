# Package JSON Loading Utilities for ESM

## Usage
```js
// package.js
import { loadPackageFile } from '@parameter1/package-utils';

export default loadPackageFile(import.meta.url, './package.json');

// some-other-file.js
import pkg from './package.js';

console.log(pkg.name);
```
