const functionExec = require('function-exec-sync');
const versionExecPath = require('./versionExecPath.ts');
const SLEEP_MS = 60;

export default function call(version: string, filePath: string /* arguments */): any {
  const args = Array.prototype.slice.call(arguments, 2);

  // local - just call
  if (version === 'local') {
    const fn = require(filePath);
    return typeof fn == 'function' ? fn.apply(null, args) : fn;
  } 
  // call a version of node
  else {
    const execPath = versionExecPath(version);
    return functionExec({execPath, env: process.env, cwd: process.cwd(), sleep: SLEEP_MS}, filePath, ...args)  
  }
}
