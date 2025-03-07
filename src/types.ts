export type VersionInfo = {
  version: string;
  callbacks?: boolean;
  storagePath: string;
  env?: NodeJS.ProcessEnv;
};
