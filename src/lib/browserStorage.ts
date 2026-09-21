type StorageArea = 'local' | 'session';

function storage(area: StorageArea): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return area === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readBrowserStorage(area: StorageArea, key: string): string | null {
  try {
    return storage(area)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeBrowserStorage(area: StorageArea, key: string, value: string): boolean {
  try {
    const target = storage(area);
    if (!target) return false;
    target.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeBrowserStorage(area: StorageArea, key: string): void {
  try {
    storage(area)?.removeItem(key);
  } catch {
    // Storage is optional; the test must still work when it is unavailable.
  }
}
