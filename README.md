# node-version-call

Call a function in a specific version of Node. Installs the version if not found.

## Install

```sh
npm install node-version-call
```

See also [node-version-call-local](https://github.com/kmalakoff/node-version-call-local) for a lightweight alternative that uses Node versions already in PATH.

## Sync API

```javascript
import { callSync, bindSync } from 'node-version-call';

// Immediate call - returns value synchronously
const result = callSync('18', './worker.cjs', {}, 'first', 'second');

// Bound caller for repeated use
const worker = bindSync('>=20', './worker.cjs', {});
const result1 = worker('first');
const result2 = worker('second');
```

## Async API

```javascript
import call, { bind } from 'node-version-call';

// With callback (last argument is function)
call('18', './worker.cjs', {}, 'first', (err, result) => {
  if (err) return console.error(err);
  console.log(result);
});

// With Promise (no callback)
const result = await call('18', './worker.cjs', {}, 'first');

// Bound caller with callback
const worker = bind('>=20', './worker.cjs', {});
worker('first', (err, result) => { /* ... */ });

// Bound caller with Promise
const result = await worker('first');
```

The worker file must export a function. For example, `worker.cjs` can contain `module.exports = (...args) => args.join(' ');`. A version range may install a matching Node.js release on first use, so the first call needs network access and writable storage.

## Options

```typescript
interface CallOptions {
  callbacks?: boolean;      // Worker uses callback style (default: false)
  spawnOptions?: boolean;   // Use spawnOptions for child process env setup (default: true)
  storagePath?: string;     // Where to install Node versions
  env?: NodeJS.ProcessEnv;  // Environment variables (default: process.env)
  moduleType?: 'auto' | 'module' | 'commonjs';
  interop?: 'default' | 'raw' | 'typescript';
}
```

- **callbacks** - Set to `true` if the worker function uses callback style (`fn(...args, callback)`) rather than returning a value or Promise
- **spawnOptions** - When `true`, sets up proper environment (PATH, etc.) so child processes spawned by the worker use the correct Node version
- **storagePath** - Directory where Node versions will be installed
- **env** - Custom environment variables to pass to the worker
- **moduleType** - Override automatic CommonJS or ESM worker detection
- **interop** - Control how ESM default exports are passed across the process boundary

## Documentation

[API Docs](https://kmalakoff.github.io/node-version-call/)
