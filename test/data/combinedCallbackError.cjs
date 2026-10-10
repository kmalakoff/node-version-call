module.exports = function (values, callback) {
  var operation = new Error(values.operation);
  operation.stack = values.operationStack;
  operation.status = 17;
  operation.stderr = values.operation;
  var restoration = new Error(values.restoration);
  restoration.stack = values.restorationStack;
  restoration.code = 'ENOENT';
  restoration.path = values.target;
  var error = new Error('operation and restoration failed');
  error.errors = [operation, restoration];
  error.workerPid = process.pid;
  error.workerVersion = process.version;
  callback(error);
};
