export type CallOptions = {
  callbacks?: boolean;
  storagePath?: string;
  env?: NodeJS.ProcessEnv;
};

export type BindOptions = CallOptions;

export type CallerCallback = (err: unknown, result?: unknown) => void;

export type BoundCaller = (...args: unknown[]) => unknown;

// Deprecated types - kept for backwards compatibility
/** @deprecated Use CallOptions instead */
export type VersionInfo = {
  version: string;
  callbacks?: boolean;
  storagePath?: string;
  env?: NodeJS.ProcessEnv;
};

/** @deprecated Use BindOptions instead */
export type WrapOptions = {
  callbacks?: boolean;
  storagePath?: string;
  env?: NodeJS.ProcessEnv;
};

/** @deprecated Use CallerCallback instead */
export type WrapperCallback = (err: unknown, result?: unknown) => void;

/** @deprecated Use BoundCaller instead */
export type Wrapper = (version: string, ...args: unknown[]) => void;
