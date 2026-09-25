import { GenreSchema, MUSICPersonality } from '@/types';
import { encodeScores } from './compatibility';
import type { Language } from '@/types/i18n';

const CATEGORY_THEMES: Record<GenreSchema['category'], { accent: string; secondary: string }> = {
  JAZZ: { accent: '#BCA7FF', secondary: '#43F5FF' },
  ROCK: { accent: '#FF6F7D', secondary: '#FFC533' },
  ELECTRONIC: { accent: '#43F5FF', secondary: '#6C3BFF' },
  CLASSICAL: { accent: '#E7D8B8', secondary: '#BCA7FF' },
  POP: { accent: '#FF77A8', secondary: '#FFC533' },
  HIP_HOP: { accent: '#C8FF3D', secondary: '#FFC533' },
  RNB: { accent: '#BCA7FF', secondary: '#FF77A8' },
  WORLD: { accent: '#59D499', secondary: '#43F5FF' },
};

export function getGenreTheme(genre?: GenreSchema | null) {
  return genre ? CATEGORY_THEMES[genre.category] : { accent: '#C8FF3D', secondary: '#43F5FF' };
}

export function createResultSearchParams(scores: MUSICPersonality, language: Language = 'ko') {
  const params = new URLSearchParams({
    v: '2',
    m: String(Math.round(scores.mellow)),
    u: String(Math.round(scores.unpretentious)),
    s: String(Math.round(scores.sophisticated)),
    i: String(Math.round(scores.intense)),
    c: String(Math.round(scores.contemporary)),
  });
  if (language !== 'ko') params.set('lang', language);
  return params;
}

function readScore(params: URLSearchParams, shortKey: string, legacyKey: keyof MUSICPersonality) {
  const raw = params.get(shortKey) ?? params.get(legacyKey);
  if (raw === null || raw.trim() === '') return null;
  const score = Number(raw);
  if (!Number.isFinite(score) || score < 0 || score > 100) return null;
  return Math.round(score);
}

export function parseResultSearchParams(params: URLSearchParams): MUSICPersonality | null {
  const mellow = readScore(params, 'm', 'mellow');
  const unpretentious = readScore(params, 'u', 'unpretentious');
  const sophisticated = readScore(params, 's', 'sophisticated');
  const intense = readScore(params, 'i', 'intense');
  const contemporary = readScore(params, 'c', 'contemporary');

  if ([mellow, unpretentious, sophisticated, intense, contemporary].some(value => value === null)) {
    return null;
  }

  return {
    mellow: mellow!,
    unpretentious: unpretentious!,
    sophisticated: sophisticated!,
    intense: intense!,
    contemporary: contemporary!,
  };
}

export function getResultUrl(scores: MUSICPersonality, language: Language = 'ko') {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams({ score: encodeScores(scores), sv: '2', lang: language, pv: '2' });
  return `${window.location.origin}/result?${params.toString()}`;
}
