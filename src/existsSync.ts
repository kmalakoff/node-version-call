const accessSync = require('fs-access-sync-compat');

export default function path(path) {
  try {
    accessSync(path);
    return true;
  } catch (err) {
    return false;
  }
}
