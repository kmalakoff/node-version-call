"use strict";
module.exports = function callFn(filePath, args) {
    try {
        var fn = require(filePath);
        var value = typeof fn == "function" ? fn.apply(null, args) : fn;
        return {
            value: value
        };
    } catch (err) {
        return {
            error: {
                message: err.message,
                stack: err.stack
            }
        };
    }
};
