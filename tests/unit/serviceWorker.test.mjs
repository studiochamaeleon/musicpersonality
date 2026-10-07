import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');
const origin = 'https://muti.example';
const absolute = path => new URL(path, origin).href;
const chunkA = '/_next/static/chunks/aaaaaaaaaaaaaaaa.js';
const chunkB = '/_next/static/chunks/bbbbbbbbbbbbbbbb.js';
const styleA = '/_next/static/chunks/1111111111111111.css';
const shell = (label, chunk = chunkA) => `<html><head><link rel="stylesheet" href="${styleA}"><script src="${chunk}"></script><script src="https://ads.example/script.js"></script></head><body>${label}</body></html>`;

function withUrl(response, url, redirected = false) {
  Object.defineProperty(response, 'url', { configurable: true, value: absolute(url) });
  Object.defineProperty(response, 'redirected', { configurable: true, value: redirected });
  const originalClone = response.clone.bind(response);
  response.clone = () => withUrl(originalClone(), url, redirected);
  return response;
}

const html = (body, url = '/', init = {}) => withUrl(new Response(body, { status: 200, ...init, headers: { 'Content-Type': 'text/html', ...init.headers } }), url, init.redirected);
const asset = (body, url, init = {}) => withUrl(new Response(body, { status: 200, ...init, headers: { 'Content-Type': url.endsWith('.css') ? 'text/css' : 'application/javascript', ...init.headers } }), url);
const request = (url = '/', options = {}) => ({ url: absolute(url), method: 'GET', mode: 'navigate', ...options, headers: new Headers(options.headers) });

function worker(options = {}) {
  const listeners = new Map();
  const stores = new Map();
  const calls = [];
  const deleted = [];
  let claims = 0;
  let skips = 0;
  const key = value => absolute(typeof value === 'string' ? value : value.url);
  const seed = (name, path, response) => {
    if (!stores.has(name)) stores.set(name, new Map());
    stores.get(name).set(key(path), response.clone());
  };
  const cacheStorage = {
    open: async name => {
      if (options.failOpen) throw new Error('Cache storage denied');
      if (!stores.has(name)) stores.set(name, new Map());
      return {
        match: async value => {
          if (options.failMatch) throw new Error('Cache read denied');
          return stores.get(name).get(key(value))?.clone();
        },
        put: async (value, response) => {
          if (options.failPut?.(key(value), name)) throw new Error('Quota exceeded');
          stores.get(name).set(key(value), response.clone());
        },
        keys: async () => [...stores.get(name).keys()].map(url => new Request(url)),
      };
    },
    keys: async () => {
      if (options.failKeys) throw new Error('Cache listing denied');
      return [...stores.keys()];
    },
    delete: async name => { deleted.push(name); return stores.delete(name); },
  };
  const network = async (value, init) => {
    const url = key(value);
    calls.push({ url, init });
    if (options.fetch) return options.fetch(url, init);
    if (url === absolute('/')) return html(shell('installed'));
    return asset('asset', url);
  };
  vm.runInNewContext(source, {
    URL, Headers, Response, Request, caches: cacheStorage, fetch: network,
    self: {
      location: { origin },
      addEventListener: (name, listener) => listeners.set(name, listener),
      skipWaiting: async () => { skips += 1; },
      clients: { claim: async () => { claims += 1; } },
    },
  });
  const dispatch = (name, data = {}) => {
    const pending = [];
    let response;
    listeners.get(name)({ ...data, waitUntil: promise => pending.push(Promise.resolve(promise)), respondWith: promise => { response = Promise.resolve(promise); } });
    return {
      get response() { return response; },
      get intercepted() { return Boolean(response); },
      get waitUntilCount() { return pending.length; },
      flush: async () => {
        if (response) await response;
        let processed = 0;
        while (processed < pending.length) {
          const batch = pending.slice(processed);
          processed = pending.length;
          await Promise.all(batch);
        }
      },
    };
  };
  return { stores, calls, deleted, seed, dispatch, get claims() { return claims; }, get skips() { return skips; } };
}

test('install prepares only canonical home and its hashed scripts/styles without forcing an update', async () => {
  const w = worker();
  await w.dispatch('install').flush();
  assert.deepEqual([...w.stores.get('muti-home-v2').keys()], [absolute('/')]);
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(chunkA)));
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(styleA)));
  assert.equal(w.calls.some(call => call.url.startsWith('https://ads.example')), false);
  assert.equal(w.calls.every(call => call.init.cache === 'no-store'), true);
  assert.equal(w.skips, 0);
});

test('an online canonical navigation replaces the offline snapshot only after new hashed dependencies are ready', async () => {
  const w = worker({ fetch: async url => url === absolute('/') ? html(shell('new deployment', chunkB)) : asset('new asset', url) });
  w.seed('muti-home-v2', '/', html(shell('old deployment')));
  w.seed('muti-assets-v2', chunkA, asset('old script', chunkA));
  const navigation = w.dispatch('fetch', { request: request() });
  assert.match(await (await navigation.response).text(), /new deployment/);
  await navigation.flush();
  assert.match(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), /new deployment/);
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(chunkB)));
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(chunkA)), 'old offline/runtime chunks are not evicted');
  assert.equal(w.calls[0].init.cache, 'no-store');
});

test('failed or HTML-masquerading new chunks retain the old coherent shell but do not hide fresh online HTML', async () => {
  for (const invalid of [html('not found', chunkB, { status: 404 }), html('static fallback', chunkB)]) {
    const w = worker({ fetch: async url => url === absolute('/') ? html(shell('new', chunkB)) : url === absolute(chunkB) ? invalid.clone() : asset('css', url) });
    w.seed('muti-home-v2', '/', html(shell('old')));
    const navigation = w.dispatch('fetch', { request: request() });
    assert.match(await (await navigation.response).text(), /new/);
    await navigation.flush();
    assert.match(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), /old/);
  }
});

test('a quota failure while preparing a dependency keeps the previous snapshot and valid network response', async () => {
  const w = worker({ failPut: url => url === absolute(chunkB), fetch: async url => url === absolute('/') ? html(shell('new', chunkB)) : asset('asset', url) });
  w.seed('muti-home-v2', '/', html(shell('old')));
  const navigation = w.dispatch('fetch', { request: request() });
  assert.match(await (await navigation.response).text(), /new/);
  await navigation.flush();
  assert.match(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), /old/);
});

test('CacheStorage open/read/write failures never reject a successful online page or asset', async () => {
  for (const failure of [{ failOpen: true }, { failMatch: true }, { failPut: () => true }]) {
    const w = worker({ ...failure, fetch: async url => url === absolute('/') ? html(shell('online')) : asset('online asset', url) });
    for (const req of [request(), request(chunkB, { mode: 'cors' }), request('/favicon-32x32.png', { mode: 'no-cors' })]) {
      const event = w.dispatch('fetch', { request: req });
      assert.equal((await event.response).status, 200);
      await event.flush();
    }
    await w.dispatch('activate').flush();
    assert.equal(w.claims, 1);
  }
});

test('a true network failure serves the canonical home for root and score URL visits without retaining their URL', async () => {
  const w = worker({ fetch: async () => { throw new Error('Offline'); } });
  w.seed('muti-home-v2', '/', html(shell('offline canonical')));
  for (const path of ['/', '/?v=3&m=90&u=40&s=70&i=20&c=60', '/?lang=ja&view=genre-explorer']) {
    const navigation = w.dispatch('fetch', { request: request(path) });
    const response = await navigation.response;
    assert.equal(response.url, absolute('/'));
    assert.match(await response.text(), /offline canonical/);
    await navigation.flush();
  }
  assert.deepEqual([...w.stores.get('muti-home-v2').keys()], [absolute('/')]);
});

test('successful score/query pages never enter the canonical home cache under a sanitized key', async () => {
  const w = worker({ fetch: async url => html('personal response', url) });
  w.seed('muti-home-v2', '/', html('canonical response'));
  for (const path of ['/?v=3&m=90&u=40&s=70&i=20&c=60', '/?lang=en', '/?view=genre-explorer']) {
    const event = w.dispatch('fetch', { request: request(path) });
    assert.equal(await (await event.response).text(), 'personal response');
    await event.flush();
  }
  const cached = w.stores.get('muti-home-v2').get(absolute('/'));
  assert.equal(cached.url, absolute('/'));
  assert.equal(await cached.clone().text(), 'canonical response');
  assert.deepEqual([...w.stores.get('muti-home-v2').keys()], [absolute('/')]);
});

test('dynamic shares/APIs, RSC, documents, foreign origins, and non-GET requests bypass the worker', async () => {
  const w = worker();
  for (const req of [
    ...['/share', '/share/', '/share/preview', '/result', '/result/', '/api', '/api/', '/api/og', '/privacy', '/privacy/', '/terms/', '/sitemap.xml', '/robots.txt', '/google617bf3e9e817ee7c.html'].map(path => request(path)),
    request('https://muti.example.evil.test/'),
    request('/?_rsc=private-fragment'),
    request('/', { headers: { RSC: '1' } }),
    request('/', { mode: 'cors', headers: { Accept: 'text/x-component' } }),
    request('/', { method: 'POST' }),
    request('/_next/static/chunks/unhashed.js', { mode: 'cors' }),
    request(`${chunkA}?m=90`, { mode: 'cors' }),
    request('/favicon-32x32.png?m=90', { mode: 'no-cors' }),
  ]) {
    const event = w.dispatch('fetch', { request: req });
    assert.equal(event.intercepted, false, req.url);
    await event.flush();
  }
  assert.equal(w.calls.length, 0);
  assert.equal(w.stores.size, 0);
});

test('HTTP error pages are returned as-is instead of being concealed by stale offline success', async () => {
  const w = worker({ fetch: async url => html('server error', url, { status: 503 }) });
  w.seed('muti-home-v2', '/', html('old successful page'));
  const event = w.dispatch('fetch', { request: request() });
  assert.equal((await event.response).status, 503);
  await event.flush();
  assert.equal(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), 'old successful page');
});

test('unhashed public artwork is refreshed online and only falls back after a network failure', async () => {
  let offline = false;
  const w = worker({ fetch: async url => { if (offline) throw new Error('Offline'); return asset('new artwork', url); } });
  w.seed('muti-assets-v2', '/favicon-32x32.png', asset('old artwork', '/favicon-32x32.png'));
  const first = w.dispatch('fetch', { request: request('/favicon-32x32.png', { mode: 'no-cors' }) });
  assert.equal(await (await first.response).text(), 'new artwork');
  await first.flush();
  assert.equal(w.calls[0].init.cache, 'no-store');
  offline = true;
  const second = w.dispatch('fetch', { request: request('/favicon-32x32.png', { mode: 'no-cors' }) });
  assert.equal(await (await second.response).text(), 'new artwork');
  await second.flush();
});

test('hashed chunks use their exact immutable key and cache a network miss without evicting older chunks', async () => {
  const w = worker();
  w.seed('muti-assets-v2', chunkA, asset('old cached immutable chunk', chunkA));
  const old = w.dispatch('fetch', { request: request(chunkA, { mode: 'cors' }) });
  assert.equal(old.waitUntilCount, 1, 'event lifetime is extended synchronously before asynchronous cache reads');
  assert.equal(await (await old.response).text(), 'old cached immutable chunk');
  await old.flush();
  assert.equal(w.calls.length, 0);
  const fresh = w.dispatch('fetch', { request: request(chunkB, { mode: 'cors' }) });
  assert.equal(fresh.waitUntilCount, 1);
  assert.equal((await fresh.response).status, 200);
  await fresh.flush();
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(chunkA)));
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(chunkB)));
});

test('activation migrates exact legacy hashed assets, discards sensitive legacy entries, and leaves unrelated caches intact', async () => {
  const w = worker();
  w.seed('muti-v1', '/', html(shell('legacy')));
  w.seed('muti-v1', chunkA, asset('legacy chunk', chunkA));
  w.seed('muti-v1', styleA, asset('legacy style', styleA));
  w.seed('muti-v1', '/?m=99', html('legacy personal page', '/?m=99'));
  w.seed('muti-v1', '/share/?m=99', html('legacy personal share', '/share/?m=99'));
  w.seed('music-personality-v1', chunkB, asset('legacy second chunk', chunkB));
  for (const name of ['magazine-cache', 'muti-feedback', 'music-personality-magazine', 'muti-home-v3']) w.seed(name, '/', html(name));
  await w.dispatch('activate').flush();
  assert.deepEqual(w.deleted.sort(), ['music-personality-v1', 'muti-v1']);
  for (const name of ['magazine-cache', 'muti-feedback', 'music-personality-magazine', 'muti-home-v3']) assert.ok(w.stores.has(name));
  assert.deepEqual([...w.stores.get('muti-home-v2').keys()], [absolute('/')]);
  assert.equal(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), shell('legacy'));
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(chunkA)));
  assert.ok(w.stores.get('muti-assets-v2').has(absolute(chunkB)));
  assert.equal(w.claims, 1);
  assert.equal(w.skips, 0);
});

test('migration write failure retains recoverable old assets and still activates the online worker', async () => {
  const w = worker({ failPut: () => true });
  w.seed('muti-v1', chunkA, asset('old chunk', chunkA));
  await w.dispatch('activate').flush();
  assert.ok(w.stores.has('muti-v1'));
  assert.equal(w.deleted.length, 0);
  assert.equal(w.claims, 1);
});

test('private or no-store public artwork and hashed assets remain online-only', async () => {
  for (const cacheControl of ['private', 'public, no-store']) {
    const w = worker({ fetch: async url => asset('not cacheable', url, { headers: { 'Cache-Control': cacheControl } }) });
    for (const path of ['/favicon-32x32.png', chunkB]) {
      const event = w.dispatch('fetch', { request: request(path, { mode: 'no-cors' }) });
      assert.equal(await (await event.response).text(), 'not cacheable');
      await event.flush();
      assert.equal(w.stores.get('muti-assets-v2')?.has(absolute(path)) ?? false, false);
    }
  }
});

test('an unsupported mutable HTML dependency keeps the previous offline shell without blocking the new online page', async () => {
  const w = worker({ fetch: async () => html('<html><script src="/mutable-app.js"></script><body>new online page</body></html>') });
  w.seed('muti-home-v2', '/', html(shell('old coherent page')));
  const event = w.dispatch('fetch', { request: request() });
  assert.match(await (await event.response).text(), /new online page/);
  await event.flush();
  assert.match(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), /old coherent page/);
});

test('a slow earlier navigation cannot overwrite a newer coherent offline snapshot', async () => {
  let resolveOldChunk;
  let visits = 0;
  const oldChunk = new Promise(resolve => { resolveOldChunk = resolve; });
  const w = worker({ fetch: async url => {
    if (url === absolute('/')) return html(shell(++visits === 1 ? 'first slow' : 'second current', visits === 1 ? chunkA : chunkB));
    if (url === absolute(chunkA)) return oldChunk;
    return asset('asset', url);
  } });
  const first = w.dispatch('fetch', { request: request() });
  assert.match(await (await first.response).text(), /first slow/);
  const second = w.dispatch('fetch', { request: request() });
  await second.flush();
  resolveOldChunk(asset('slow old chunk', chunkA));
  await first.flush();
  assert.match(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), /second current/);
});

test('redirected, private, non-HTML, and query-bearing responses cannot replace clean canonical HTML', async () => {
  for (const response of [
    html('redirected', '/', { redirected: true }),
    html('private', '/', { headers: { 'Cache-Control': 'private' } }),
    html('not storable', '/', { headers: { 'Cache-Control': 'no-store' } }),
    html('query redirect target', '/?m=95'),
    asset('RSC fragment', '/', { headers: { 'Content-Type': 'text/x-component' } }),
  ]) {
    const w = worker({ fetch: async () => response.clone() });
    w.seed('muti-home-v2', '/', html('canonical safe'));
    const event = w.dispatch('fetch', { request: request() });
    assert.equal((await event.response).status, 200);
    await event.flush();
    assert.equal(await w.stores.get('muti-home-v2').get(absolute('/')).clone().text(), 'canonical safe');
  }
});

test('an offline first visit without a prepared home produces a genuine network error, not fake HTML success', async () => {
  const w = worker({ failOpen: true, fetch: async () => { throw new Error('Offline first visit'); } });
  const event = w.dispatch('fetch', { request: request() });
  assert.equal((await event.response).type, 'error');
  await event.flush();
});

test('registration bypasses HTTP worker-script caching, retries on online, and never installs a reload handler', async () => {
  const layout = readFileSync(new URL('../../src/app/layout.tsx', import.meta.url), 'utf8');
  const registration = layout.match(/__html:\s*`([\s\S]*?)`/)[1];
  const handlers = new Map();
  const calls = [];
  let reloads = 0;
  vm.runInNewContext(registration, {
    navigator: { serviceWorker: { register: async (url, options) => { calls.push({ url, options }); if (calls.length === 1) throw new Error('Network down'); return {}; } } },
    document: { readyState: 'loading' },
    window: { addEventListener: (name, listener) => handlers.set(name, listener), location: { reload: () => { reloads += 1; } } },
    console: { log: () => undefined },
  });
  assert.equal(calls.length, 0);
  handlers.get('load')();
  await Promise.resolve();
  await Promise.resolve();
  handlers.get('online')();
  await Promise.resolve();
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, '/sw.js');
  assert.equal(calls[0].options.scope, '/');
  assert.equal(calls[0].options.updateViaCache, 'none');
  assert.equal(handlers.has('controllerchange'), false);
  assert.equal(reloads, 0);
});
