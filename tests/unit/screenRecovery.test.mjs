import test from 'node:test';
import assert from 'node:assert/strict';
import { screenFailureNeedsReload } from '../../src/lib/screenRecovery.ts';

test('known module runtimes and browser chunk failures require an explicit page reload to discard cached rejections', () => {
  for (const error of [
    new Error('Failed to load chunk /_next/static/chunks/abc.js from module 123'),
    Object.assign(new Error('Loading chunk 123 failed.\n(error: /_next/static/chunks/abc.js)'), { name: 'ChunkLoadError' }),
    new TypeError('Failed to fetch dynamically imported module: https://example.invalid/chunk.js'),
    new TypeError('Importing a module script failed.'),
    new Error('wrapped import failure', { cause: new Error('Failed to load chunk /abc.js') }),
  ]) assert.equal(screenFailureNeedsReload(error), true);
});

test('render errors, malformed values and circular causes do not cause automatic reload or classify as chunk failure', () => {
  const circular = new Error('screen render failed');
  circular.cause = circular;
  const hostile = { get message() { throw new Error('invalid error getter'); } };
  for (const error of [circular, hostile, new Error('unexpected render value'), null, undefined, 'Failed to load chunk', {}, { message: 123 }]) assert.equal(screenFailureNeedsReload(error), false);
});
