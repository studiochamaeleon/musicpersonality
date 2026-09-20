import { MUSICPersonality } from '@/types';
import { MUSIC_TRAITS } from '@/lib/compatibility';

const STORAGE_KEY = 'music-personality-recent-results-v1';
const MAX_RESULTS = 3;

export interface RecentMusicResult {
  id: string;
  scores: MUSICPersonality;
  topGenreId: string;
  createdAt: number;
}

function isScores(value: unknown): value is MUSICPersonality {
  if (!value || typeof value !== 'object') return false;
  const scores = value as Record<string, unknown>;
  return MUSIC_TRAITS.every(key => typeof scores[key] === 'number' && Number.isFinite(scores[key]) && scores[key] >= 0 && scores[key] <= 100);
}

function isRecentResult(value: unknown): value is RecentMusicResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<RecentMusicResult>;
  return typeof result.id === 'string'
    && typeof result.topGenreId === 'string'
    && typeof result.createdAt === 'number'
    && isScores(result.scores);
}

export function loadRecentResults(): RecentMusicResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isRecentResult).slice(0, MAX_RESULTS) : [];
  } catch {
    return [];
  }
}

export function saveRecentResult(scores: MUSICPersonality, topGenreId: string) {
  if (typeof window === 'undefined') return [];
  const fingerprint = MUSIC_TRAITS.map(key => Math.round(scores[key])).join('-');
  const next: RecentMusicResult = {
    id: `${Date.now()}-${fingerprint}`,
    scores,
    topGenreId,
    createdAt: Date.now(),
  };
  const deduplicated = loadRecentResults().filter(result => MUSIC_TRAITS.some(key => Math.round(result.scores[key]) !== Math.round(scores[key])));
  const results = [next, ...deduplicated].slice(0, MAX_RESULTS);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch {
    return loadRecentResults();
  }
  return results;
}
