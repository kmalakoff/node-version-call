export type VersionInfo = {
    version: string;
    callbacks: boolean;
};
export default function call(version: string | VersionInfo, filePath: string, ...args: any[]): any;
