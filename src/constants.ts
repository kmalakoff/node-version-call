export const isWindows = process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE);
export const node = isWindows ? 'node.exe' : 'node';
