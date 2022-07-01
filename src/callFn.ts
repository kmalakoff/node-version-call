module.exports = function callFn(filePath: string, args: any[]): any {
  try {
    const fn = require(filePath);
    const value = typeof fn == 'function' ? fn.apply(null, args) : fn;
    return { value };
  } catch (err) {
    return { error: { message: err.message, stack: err.stack } };
  }
};
