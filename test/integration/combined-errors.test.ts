// May download real Node releases through node-version-call's storagePath.
import assert from 'assert';
import call, { bind, bindSync, callSync } from 'node-version-call';
import path from 'path';
import semver from 'semver';
import url from 'url';

const __dirname = path.dirname(typeof __filename !== 'undefined' ? __filename : url.fileURLToPath(import.meta.url));
const workerPath = path.join(__dirname, '..', 'data', 'combinedCallbackError.cjs');
const options = { callbacks: true, storagePath: path.join(__dirname, '..', '..', '.tmp', 'combined-error-runtimes') };
const remoteVersion = +process.versions.node.split('.')[0] === 20 ? '22' : '20';
const values = {
  operation: 'generation failed "quoted"',
  operationStack: 'generation stack',
  restoration: 'restoration failed',
  restorationStack: 'restoration stack',
  target: 'owned installation',
};

type TransportError = Error & {
  workerPid: number;
  workerVersion: string;
  errors: (Error & { status?: number; stderr?: string; code?: string; path?: string })[];
};

function assertCombined(error: unknown, version: string): void {
  assert.ok(error instanceof Error);
  const aggregate = error as TransportError;
  assert.strictEqual(aggregate.message, 'operation and restoration failed');
  assert.notStrictEqual(aggregate.workerPid, process.pid);
  assert.ok(semver.satisfies(aggregate.workerVersion, version), aggregate.workerVersion);
  assert.strictEqual(aggregate.errors.length, 2);
  const operation = aggregate.errors[0];
  const restoration = aggregate.errors[1];
  assert.ok(operation instanceof Error);
  assert.strictEqual(operation.message, values.operation);
  assert.strictEqual(operation.stack, values.operationStack);
  assert.strictEqual(operation.status, 17);
  assert.strictEqual(operation.stderr, values.operation);
  assert.ok(restoration instanceof Error);
  assert.strictEqual(restoration.message, values.restoration);
  assert.strictEqual(restoration.stack, values.restorationStack);
  assert.strictEqual(restoration.code, 'ENOENT');
  assert.strictEqual(restoration.path, values.target);
}

describe('combined callback-worker error transport', () => {
  it('preserves ordered errors through public bind to a >=20 worker', () => {
    const worker = bind('>=20', workerPath, options);
    let calls = 0;
    let caught: unknown;
    let result: unknown;
    worker(values, (error: unknown, value: unknown) => {
      ++calls;
      caught = error;
      result = value;
    });
    assert.strictEqual(calls, 1);
    assert.strictEqual(result, undefined);
    assertCombined(caught, '>=20');
  });

  it('preserves ordered errors through public call to a >=20 worker', () => {
    let calls = 0;
    let caught: unknown;
    let result: unknown;
    call('>=20', workerPath, options, values, (error: unknown, value: unknown) => {
      ++calls;
      caught = error;
      result = value;
    });
    assert.strictEqual(calls, 1);
    assert.strictEqual(result, undefined);
    assertCombined(caught, '>=20');
  });

  it('throws ordered errors through public bindSync to a different runtime', () => {
    const worker = bindSync(remoteVersion, workerPath, options);
    let caught: unknown;
    try {
      worker(values);
    } catch (error: unknown) {
      caught = error;
    }
    assertCombined(caught, remoteVersion);
  });

  it('throws ordered errors through public callSync to a different runtime', () => {
    let caught: unknown;
    try {
      callSync(remoteVersion, workerPath, options, values);
    } catch (error: unknown) {
      caught = error;
    }
    assertCombined(caught, remoteVersion);
  });

  it('preserves ordered errors from a same-runtime callback worker', () => {
    const worker = bind(process.version, workerPath, options);
    let calls = 0;
    let caught: unknown;
    worker(values, (error: unknown) => {
      ++calls;
      caught = error;
    });
    assert.strictEqual(calls, 1);
    assertCombined(caught, process.version);
  });
});
