import path from 'path';

import type { InstallDirs } from './types.js';

export default function getInstallDirs(installDir: string): InstallDirs {
  return {
    cacheDirectory: path.join(installDir, 'cache'),
    buildDirectory: path.join(installDir, 'build'),
    installDirectory: path.join(installDir, 'installed'),
  };
}
