export type VersionInfo = {
  version: string;
  callbacks?: boolean;
  storagePath: string;
  env?: NodeJS.ProcessEnv;
};

export type WrapOptions = {
  callbacks?: boolean;
  storagePath?: string;
  env?: NodeJS.ProcessEnv;
};

export type WrapperCallback = (err: unknown, result?: unknown) => void;

export type Wrapper = (version: string, ...args: unknown[]) => void;
