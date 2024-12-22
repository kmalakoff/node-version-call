export type VersionInfo = {
  version: string;
  installDir?: string;
  callbacks?: boolean;
};

export type InstallDirs = {
  cacheDirectory: string;
  buildDirectory: string;
  installDirectory: string;
};
