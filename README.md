## node-version-call

Call a function in a specific version of node for browser and node

### Example 1

```typescript
import call from 'node-version-call';

const result = call('path/to/file.js', '0.8', { args: [1, 2, 3] });
console.log(result); // return value
```

### Example 2

```javascript
var call = require('node-version-call'); // old js calling lts js

var result = call('path/to/file.js', 'lts', { args: [1, 2, 3] });
console.log(result); // return value
```

### Documentation

[API Docs](https://kmalakoff.github.io/node-version-call/)
