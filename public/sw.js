const HOME_CACHE = 'muti-home-v2';
const ASSET_CACHE = 'muti-assets-v2';
const LEGACY_CACHES = ['muti-v1', 'music-personality-v1'];
const PUBLIC_ASSETS = [
  '/icon-192x192.svg', '/icon-512x512.svg', '/og-image.svg', '/og-image.png',
  '/favicon-16x16.png', '/favicon-32x32.png', '/favicon-48x48.png',
  '/favicon-64x64.png', '/apple-touch-icon.png', '/manifest.webmanifest',
];
let homeRequestSequence = 0;

const homeUrl = () => new URL('/', self.location.origin).href;
const isDynamicRequest = (url) => /^\/(?:share|result|api)(?:\/|$)/.test(url.pathname);
const isRscRequest = (request, url) => request.headers.get('RSC') === '1'
  || request.headers.get('Accept')?.includes('text/x-component')
  || url.searchParams.has('_rsc');
const isCleanHomeUrl = (url) => url.origin === self.location.origin && url.pathname === '/' && !url.search && !url.hash;
const isImmutableAsset = (url) => {
  if (url.origin !== self.location.origin || url.search || url.hash || !url.pathname.startsWith('/_next/static/')) return false;
  const filename = url.pathname.split('/').pop();
  return /(?:^|[.-])[a-f\d]{8,}(?:[.-]|$)/i.test(filename)
    || /^\/_next\/static\/[^/]+\/_(?:build|ssg)Manifest\.js$/.test(url.pathname);
};
const isAssetResponse = (response) => response?.status === 200
  && !/text\/(?:html|x-component)/i.test(response.headers.get('Content-Type') || '')
  && !/\b(?:private|no-store)\b/i.test(response.headers.get('Cache-Control') || '');
const isHomeResponse = (response) => {
  if (response?.status !== 200 || response.redirected || !/text\/html/i.test(response.headers.get('Content-Type') || '')) return false;
  if (/\b(?:private|no-store)\b/i.test(response.headers.get('Cache-Control') || '')) return false;
  return !response.url || isCleanHomeUrl(new URL(response.url));
};

async function readCache(name, url) {
  try { return await (await caches.open(name)).match(url); } catch { return undefined; }
}

async function saveAsset(url, response) {
  if (!isAssetResponse(response)) return;
  try { await (await caches.open(ASSET_CACHE)).put(url, response); } catch { /* Cache is optional; keep the valid online response. */ }
}

function homeDependencies(html) {
  const dependencies = new Set();
  for (const match of html.matchAll(/<(script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    if (match[1].toLowerCase() === 'link' && !/\brel\s*=\s*["'](?:stylesheet|modulepreload)["']/i.test(tag)
      && !(/\brel\s*=\s*["']preload["']/i.test(tag) && /\bas\s*=\s*["'](?:script|style)["']/i.test(tag))) continue;
    const attribute = tag.match(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/i);
    if (!attribute) continue;
    const url = new URL(attribute[2], self.location.origin);
    if (url.origin !== self.location.origin) continue;
    // Do not publish an offline shell tied to development or other mutable scripts.
    if (!isImmutableAsset(url)) throw new Error('Home dependency is not content-addressed');
    dependencies.add(url.href);
  }
  return [...dependencies];
}

async function warmHomeDependency(url) {
  const cached = await readCache(ASSET_CACHE, url);
  if (isAssetResponse(cached)) return;
  const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
  if (!isAssetResponse(response)) throw new Error('Home dependency unavailable');
  // Unlike opportunistic asset caching, a failed write must keep the previous offline shell.
  await (await caches.open(ASSET_CACHE)).put(url, response);
}

async function refreshOfflineHome(response, sequence) {
  if (!isHomeResponse(response)) return;
  const html = await response.clone().text();
  await Promise.all(homeDependencies(html).map(warmHomeDependency));
  if (sequence !== homeRequestSequence) return;
  // Only the canonical, non-personal response is ever stored, and only after its JS/CSS is ready.
  await (await caches.open(HOME_CACHE)).put(homeUrl(), response);
}

async function migrateLegacyCaches() {
  try {
    const names = (await caches.keys()).filter(name => LEGACY_CACHES.includes(name));
    const assets = await caches.open(ASSET_CACHE);
    let legacyHome;
    for (const name of names) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const url = new URL(request.url);
        const response = await cache.match(request);
        if (isImmutableAsset(url) && isAssetResponse(response)) await assets.put(url.href, response);
        else if (isCleanHomeUrl(url) && isHomeResponse(response)) legacyHome = response;
      }
    }
    if (legacyHome && !await readCache(HOME_CACHE, homeUrl())) {
      const dependencies = homeDependencies(await legacyHome.clone().text());
      const available = await Promise.all(dependencies.map(url => assets.match(url)));
      if (available.every(isAssetResponse)) await (await caches.open(HOME_CACHE)).put(homeUrl(), legacyHome);
    }
    // Known former MUTI caches only: do not delete another application or a newer worker's cache.
    await Promise.all(names.map(name => caches.delete(name)));
  } catch { /* Storage denial must not prevent activation or online use. */ }
}

self.addEventListener('install', (event) => {
  const sequence = ++homeRequestSequence;
  event.waitUntil(Promise.all([
    fetch(homeUrl(), { cache: 'no-store', credentials: 'same-origin' })
      .then(response => refreshOfflineHome(response, sequence)).catch(() => undefined),
    ...PUBLIC_ASSETS.map(path => {
      const url = new URL(path, self.location.origin).href;
      return fetch(url, { cache: 'no-store', credentials: 'same-origin' })
        .then(response => saveAsset(url, response)).catch(() => undefined);
    }),
  ]));
  // An updated worker waits for existing tabs to close; never reload an unfinished survey.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(migrateLegacyCaches().then(() => self.clients.claim()).catch(() => undefined));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || isDynamicRequest(url) || isRscRequest(request, url)) return;

  if (request.mode === 'navigate') {
    // Legal/help documents and dynamic routes must not receive a home-page fallback under their URL.
    if (url.pathname !== '/') return;
    const sequence = isCleanHomeUrl(url) ? ++homeRequestSequence : undefined;
    const network = fetch(request, { cache: 'no-store' });
    if (sequence !== undefined) event.waitUntil(network.then(response => refreshOfflineHome(response.clone(), sequence)).catch(() => undefined));
    event.respondWith(network.catch(async () => await readCache(HOME_CACHE, homeUrl()) || Response.error()));
    return;
  }

  if (isImmutableAsset(url)) {
    const result = (async () => {
      const cached = await readCache(ASSET_CACHE, url.href);
      if (isAssetResponse(cached)) return { response: cached, fromCache: true };
      return { response: await fetch(request), fromCache: false };
    })();
    event.waitUntil(result.then(({ response, fromCache }) => fromCache ? undefined : saveAsset(url.href, response.clone())).catch(() => undefined));
    event.respondWith(result.then(({ response }) => response));
    return;
  }

  if (!url.search && PUBLIC_ASSETS.includes(url.pathname)) {
    const network = fetch(request, { cache: 'no-store' });
    event.waitUntil(network.then(response => saveAsset(url.href, response.clone())).catch(() => undefined));
    event.respondWith(network.catch(async () => await readCache(ASSET_CACHE, url.href) || Response.error()));
  }
});
