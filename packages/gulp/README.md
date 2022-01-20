# Gulp
A simple Gulp wrapper for watching and serving of Node apps.

## Installation
```
yarn add @parameter1/gulp
```

## Usage
To use the Gulpfile factory...

```js
// gulpfile.js
import { gulpfile } from '@parameter/gulp/factory';

gulpfile({
  entry: 'src/index.js',
  watchPaths: ['src/**/*.js'],
});

```
