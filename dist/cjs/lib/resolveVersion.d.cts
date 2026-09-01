export type ResolvedVersion = {
    execPath: string;
    installPath: string;
};
export type ResolveOptions = {
    storagePath?: string;
};
export default function resolveVersion(version: string, options?: ResolveOptions): ResolvedVersion;
