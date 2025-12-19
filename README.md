## node-version-call

Call a function in a specific version of Node. Installs the version if not found.

See also [node-version-call-local](https://github.com/kmalakoff/node-version-call-local) for a lightweight alternative that uses Node versions already in PATH.

### Installation

```bash
npm install node-version-call
```

### Sync API (returns value, throws on error)

```javascript
import { callSync, bindSync } from 'node-version-call';

// Immediate call - returns value synchronously
const result = callSync('18', '/path/to/worker.js', {}, arg1, arg2);

// Bound caller for repeated use
const worker = bindSync('>=20', '/path/to/worker.js', {});
const result1 = worker(arg1);
const result2 = worker(arg2);
```

### Async API (callback or Promise)

```javascript
import call, { bind } from 'node-version-call';

// With callback (last argument is function)
call('18', '/path/to/worker.js', {}, arg1, (err, result) => {
  if (err) return console.error(err);
  console.log(result);
});

// With Promise (no callback)
const result = await call('18', '/path/to/worker.js', {}, arg1);

// Bound caller with callback
const worker = bind('>=20', '/path/to/worker.js', {});
worker(arg1, (err, result) => { /* ... */ });

// Bound caller with Promise
const result = await worker(arg1);
```

### Options

```typescript
interface CallOptions {
  callbacks?: boolean;      // Worker uses callback style (default: false)
  spawnOptions?: boolean;   // Use spawnOptions for child process env setup (default: true)
  storagePath?: string;     // Where to install Node versions
  env?: NodeJS.ProcessEnv;  // Environment variables (default: process.env)
}
```

- **callbacks** - Set to `true` if the worker function uses callback style (`fn(...args, callback)`) rather than returning a value or Promise
- **spawnOptions** - When `true`, sets up proper environment (PATH, etc.) so child processes spawned by the worker use the correct Node version
- **storagePath** - Directory where Node versions will be installed
- **env** - Custom environment variables to pass to the worker

### Documentation

[API Docs](https://kmalakoff.github.io/node-version-call/)
