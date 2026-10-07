import type { MUSICPersonality } from '@/types';
import type { Language } from '@/types/i18n';
import { CURRENT_RESULT_VERSION, LEGACY_RESULT_VERSION, type ResultVersion } from './resultVersion.ts';
import { buildPairNarrative } from './pairNarrative.ts';

export interface ComparisonVersions {
  hostVersion?: ResultVersion;
  guestVersion?: ResultVersion;
}

export function comparisonVersion(value: string | null): ResultVersion {
  return value === '2' ? LEGACY_RESULT_VERSION : CURRENT_RESULT_VERSION;
}

function addComparisonVersions(params: URLSearchParams, versions: ComparisonVersions) {
  if (versions.hostVersion === LEGACY_RESULT_VERSION) params.set('hv', '2');
  if (versions.guestVersion === LEGACY_RESULT_VERSION) params.set('gv', '2');
}

export const MUSIC_TRAITS = ['mellow', 'unpretentious', 'sophisticated', 'intense', 'contemporary'] as const;
export type MusicTrait = typeof MUSIC_TRAITS[number];

export interface TraitCompatibility {
  key: MusicTrait;
  label: string;
  host: number;
  guest: number;
  similarity: number;
  difference: number;
}

export interface PairCompatibility {
  score: number;
  title: string;
  description: string;
  traits: TraitCompatibility[];
  strongest: TraitCompatibility;
  biggestDifference: TraitCompatibility;
}

const TRAIT_LABELS: Record<Language, Record<MusicTrait, string>> = {
  ko: {
    mellow: '차분함',
    unpretentious: '편안함',
    sophisticated: '탐구성',
    intense: '강렬함',
    contemporary: '현대적 사운드',
  },
  en: {
    mellow: 'Mellow',
    unpretentious: 'Easygoing',
    sophisticated: 'Sophisticated',
    intense: 'Intense',
    contemporary: 'Contemporary',
  },
  ja: {
    mellow: '穏やかさ',
    unpretentious: '親しみやすさ',
    sophisticated: '探究心',
    intense: '力強さ',
    contemporary: '現代的な音',
  },
};

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function encodeScores(scores: MUSICPersonality) {
  return `v1.${MUSIC_TRAITS.map(key => clampScore(scores[key])).join('.')}`;
}

export function decodeScores(value: string | null): MUSICPersonality | null {
  if (!value) return null;
  const [version, ...rawScores] = value.split('.');
  if (version !== 'v1' || rawScores.length !== MUSIC_TRAITS.length) return null;
  const scores = rawScores.map(Number);
  if (scores.some(score => !Number.isFinite(score) || score < 0 || score > 100)) return null;

  return MUSIC_TRAITS.reduce((result, key, index) => {
    result[key] = Math.round(scores[index]);
    return result;
  }, {} as MUSICPersonality);
}

export function createComparisonHash(hostScores: MUSICPersonality, guestScores?: MUSICPersonality | null, versions: ComparisonVersions = {}) {
  const params = new URLSearchParams({ compare: encodeScores(hostScores) });
  if (guestScores) params.set('guest', encodeScores(guestScores));
  addComparisonVersions(params, versions);
  return params.toString();
}

export function parseComparisonHash(hash: string) {
  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalized);
  const hostScores = decodeScores(params.get('compare'));
  if (!hostScores) return null;
  return { hostScores, guestScores: decodeScores(params.get('guest')), hostVersion: comparisonVersion(params.get('hv')), guestVersion: comparisonVersion(params.get('gv')) };
}

export function getComparisonUrl(hostScores: MUSICPersonality, guestScores?: MUSICPersonality | null, language: Language = 'ko', versions: ComparisonVersions = {}) {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams({ host: encodeScores(hostScores) });
  if (guestScores) params.set('guest', encodeScores(guestScores));
  if (language !== 'ko') params.set('lang', language);
  addComparisonVersions(params, versions);
  return `${window.location.origin}/share?${params.toString()}`;
}

export function averageScores(first: MUSICPersonality, second: MUSICPersonality): MUSICPersonality {
  return MUSIC_TRAITS.reduce((result, key) => {
    result[key] = Math.round((first[key] + second[key]) / 2);
    return result;
  }, {} as MUSICPersonality);
}

export function calculatePairCompatibility(
  hostScores: MUSICPersonality,
  guestScores: MUSICPersonality,
  language: Language,
): PairCompatibility {
  const traits = MUSIC_TRAITS.map(key => {
    const difference = Math.abs(hostScores[key] - guestScores[key]);
    return {
      key,
      label: TRAIT_LABELS[language][key],
      host: hostScores[key],
      guest: guestScores[key],
      difference,
      similarity: 100 - difference,
    };
  });
  const score = Math.round(traits.reduce((sum, trait) => sum + trait.similarity, 0) / traits.length);
  const strongest = traits.reduce((best, trait) => trait.similarity > best.similarity ? trait : best);
  const biggestDifference = traits.reduce((largest, trait) => trait.difference > largest.difference ? trait : largest);

  const titles = language === 'ko'
    ? ['거의 같은 플레이리스트', '같이 들을수록 좋은 사이', '닮음과 새로움의 균형', '서로 다른 취향의 발견']
    : language === 'ja'
      ? ['ほぼ同じプレイリスト', '一緒に聴くほど相性のよい二人', '似ているところと新しさのバランス', '違う好みから始まる発見']
      : ['Almost the same playlist', 'Better when listening together', 'A balance of familiar and new', 'A meeting of different tastes'];
  const pair = { score, traits, strongest, biggestDifference, title: titles[score >= 88 ? 0 : score >= 74 ? 1 : score >= 60 ? 2 : 3], description: '' };
  return { ...pair, description: buildPairNarrative(pair, language).summary };
}
