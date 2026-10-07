import type { MUSICPersonality } from '../types/index.ts';
import { createComparisonHash, decodeScores, encodeScores } from './compatibility.ts';
import { readBrowserStorage, writeBrowserStorage, removeBrowserStorage } from './browserStorage.ts';
import type { ResultVersion } from './resultVersion.ts';

export const RECENT_COMPARISONS_STORAGE_KEY = 'muti-recent-comparisons-v1';
export const MAX_RECENT_COMPARISONS = 3;
export interface RecentComparison {
  id: string;
  hostScores: MUSICPersonality;
  guestScores: MUSICPersonality;
  hostVersion: ResultVersion;
  guestVersion: ResultVersion;
  createdAt: number;
}

function profile(value: unknown): MUSICPersonality | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const keys = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'];
  if (!keys.every(key => typeof record[key] === 'number' && Number.isFinite(record[key]) && Number.isInteger(record[key]) && (record[key] as number) >= 0 && (record[key] as number) <= 100)) return null;
  return decodeScores(encodeScores(value as MUSICPersonality));
}

export function parseRecentComparisons(raw: string | null): RecentComparison[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.flatMap((item: unknown) => {
      if (!item || typeof item !== 'object') return [];
      const row = item as Partial<RecentComparison>;
      const hostScores = profile(row.hostScores);
      const guestScores = profile(row.guestScores);
      if (!hostScores || !guestScores || ![2, 3].includes(row.hostVersion!) || ![2, 3].includes(row.guestVersion!) || typeof row.createdAt !== 'number' || !Number.isFinite(row.createdAt) || row.createdAt <= 0) return [];
      const id = createComparisonHash(hostScores, guestScores, { hostVersion: row.hostVersion, guestVersion: row.guestVersion });
      if (seen.has(id)) return [];
      seen.add(id);
      // Project onto the known fields; do not retain arbitrary stored metadata.
      return [{ id, hostScores, guestScores, hostVersion: row.hostVersion!, guestVersion: row.guestVersion!, createdAt: row.createdAt }];
    }).slice(0, MAX_RECENT_COMPARISONS);
  } catch { return []; }
}

export function loadRecentComparisons() {
  return parseRecentComparisons(readBrowserStorage('local', RECENT_COMPARISONS_STORAGE_KEY));
}

export function saveRecentComparisonWithStatus(host: MUSICPersonality, guest: MUSICPersonality, hostVersion: ResultVersion, guestVersion: ResultVersion): { saved: boolean; results: RecentComparison[] } {
  const hostScores = profile(host);
  const guestScores = profile(guest);
  if (!hostScores || !guestScores || ![2, 3].includes(hostVersion) || ![2, 3].includes(guestVersion)) return { saved: false, results: loadRecentComparisons() };
  const id = createComparisonHash(hostScores, guestScores, { hostVersion, guestVersion });
  const next = [{ id, hostScores, guestScores, hostVersion, guestVersion, createdAt: Date.now() }, ...loadRecentComparisons().filter(item => item.id !== id)].slice(0, MAX_RECENT_COMPARISONS);
  const saved = writeBrowserStorage('local', RECENT_COMPARISONS_STORAGE_KEY, JSON.stringify(next));
  return { saved, results: saved ? next : loadRecentComparisons() };
}

// Preserve the existing array-returning API for history consumers.
export function saveRecentComparison(host: MUSICPersonality, guest: MUSICPersonality, hostVersion: ResultVersion, guestVersion: ResultVersion): RecentComparison[] {
  return saveRecentComparisonWithStatus(host, guest, hostVersion, guestVersion).results;
}

export function deleteRecentComparison(id: string) {
  const current = loadRecentComparisons();
  const next = current.filter(item => item.id !== id);
  if (!next.length) {
    removeBrowserStorage('local', RECENT_COMPARISONS_STORAGE_KEY);
    return loadRecentComparisons();
  }
  return writeBrowserStorage('local', RECENT_COMPARISONS_STORAGE_KEY, JSON.stringify(next)) ? next : current;
}
