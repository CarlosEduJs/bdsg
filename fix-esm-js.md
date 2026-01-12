## Fix ESM JS extensions

## branch: fix/esm-js-extensions

## Problem:

- O bdsg usa "type": "module" mas o build com tsc não adiciona extensões .js nos imports. Node.js ESM exige extensões explícitas.

```js
// index.js gerado
export { generatePalette } from "./palette";  // Node ESM precisa de .js
```