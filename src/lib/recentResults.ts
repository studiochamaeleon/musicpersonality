import type { MUSICPersonality } from '../types/index.ts';
import { MUSIC_TRAITS } from './compatibility.ts';
import { readBrowserStorage, writeBrowserStorage, removeBrowserStorage } from './browserStorage.ts';
import { SURVEY_VERSION } from './surveyVersion.ts';
import { CURRENT_RESULT_VERSION, LEGACY_RESULT_VERSION, type ResultVersion } from './resultVersion.ts';

export const RECENT_RESULTS_STORAGE_KEY = 'music-personality-recent-results-v1';
export const MAX_RECENT_RESULTS = 3;

export interface RecentMusicResult {
  id: string;
  scores: MUSICPersonality;
  topGenreId: string;
  createdAt: number;
  questionVersion?: number;
  resultVersion?: ResultVersion;
}

export function getRecentResultVersion(result: RecentMusicResult): ResultVersion {
  if (result.resultVersion === LEGACY_RESULT_VERSION || result.resultVersion === CURRENT_RESULT_VERSION) return result.resultVersion;
  // Survey v2 introduced result ranking v3. Do not reinterpret those rows as
  // legacy when a later questionnaire revision raises SURVEY_VERSION.
  return (result.questionVersion ?? 0) >= 2
    ? CURRENT_RESULT_VERSION
    : LEGACY_RESULT_VERSION;
}

function isScores(value: unknown): value is MUSICPersonality {
  if (!value || typeof value !== 'object') return false;
  const scores = value as Record<string, unknown>;
  return MUSIC_TRAITS.every(key => typeof scores[key] === 'number' && Number.isFinite(scores[key]) && scores[key] >= 0 && scores[key] <= 100);
}

function isRecentResult(value: unknown): value is RecentMusicResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<RecentMusicResult>;
  return typeof result.id === 'string' && result.id.length > 0
    && typeof result.topGenreId === 'string' && result.topGenreId.length > 0
    && typeof result.createdAt === 'number' && Number.isFinite(result.createdAt) && result.createdAt > 0
    && (result.resultVersion === undefined || result.resultVersion === LEGACY_RESULT_VERSION || result.resultVersion === CURRENT_RESULT_VERSION)
    && (result.questionVersion === undefined || (Number.isInteger(result.questionVersion) && result.questionVersion > 0 && result.questionVersion <= SURVEY_VERSION))
    && isScores(result.scores);
}

function fingerprint(scores: MUSICPersonality, version: ResultVersion) {
  return `${version}:${MUSIC_TRAITS.map(key => Math.round(scores[key])).join('-')}`;
}

export function parseRecentResults(raw: string | null): RecentMusicResult[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed.filter(isRecentResult).flatMap(result => {
      const resultVersion = getRecentResultVersion(result);
      const key = fingerprint(result.scores, resultVersion);
      if (seen.has(key)) return [];
      seen.add(key);
      // Only restore the documented fields, never arbitrary stored metadata.
      return [{
        id: result.id,
        scores: Object.fromEntries(MUSIC_TRAITS.map(trait => [trait, result.scores[trait]])) as unknown as MUSICPersonality,
        topGenreId: result.topGenreId,
        createdAt: result.createdAt,
        resultVersion,
        ...(result.questionVersion === undefined ? {} : { questionVersion: result.questionVersion }),
      }];
    }).slice(0, MAX_RECENT_RESULTS);
  } catch {
    return [];
  }
}

export function loadRecentResults(): RecentMusicResult[] {
  return parseRecentResults(readBrowserStorage('local', RECENT_RESULTS_STORAGE_KEY));
}

export function saveRecentResultWithStatus(scores: MUSICPersonality, topGenreId: string): { saved: boolean; results: RecentMusicResult[] } {
  if (typeof window === 'undefined') return { saved: false, results: [] };
  if (!isScores(scores) || !topGenreId) return { saved: false, results: loadRecentResults() };
  const key = fingerprint(scores, CURRENT_RESULT_VERSION);
  const next: RecentMusicResult = {
    id: `${Date.now()}-${key}`,
    scores,
    topGenreId,
    createdAt: Date.now(),
    questionVersion: SURVEY_VERSION,
    resultVersion: CURRENT_RESULT_VERSION,
  };
  const deduplicated = loadRecentResults().filter(result => fingerprint(result.scores, getRecentResultVersion(result)) !== key);
  const results = [next, ...deduplicated].slice(0, MAX_RECENT_RESULTS);
  const saved = writeBrowserStorage('local', RECENT_RESULTS_STORAGE_KEY, JSON.stringify(results));
  return { saved, results: saved ? results : loadRecentResults() };
}

// Preserve the existing array-returning API for history consumers.
export function saveRecentResult(scores: MUSICPersonality, topGenreId: string): RecentMusicResult[] {
  return saveRecentResultWithStatus(scores, topGenreId).results;
}

export function deleteRecentResult(id: string): RecentMusicResult[] {
  const current = loadRecentResults();
  const next = current.filter(result => result.id !== id);
  if (!next.length) {
    removeBrowserStorage('local', RECENT_RESULTS_STORAGE_KEY);
    return loadRecentResults();
  }
  return writeBrowserStorage('local', RECENT_RESULTS_STORAGE_KEY, JSON.stringify(next)) ? next : current;
}
