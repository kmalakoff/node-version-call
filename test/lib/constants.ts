import path from 'path';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));

// node-install-release's download cache: version-named, renamed into place, never changed, so one copy is linked into every worktree.
export const CACHE_DIR = path.join(__dirname, '..', '..', '.cache', 'shared', 'node-install-release');
