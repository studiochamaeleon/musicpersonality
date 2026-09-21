import { MUSICPersonality } from '@/types';

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

const TRAIT_LABELS: Record<'ko' | 'en', Record<MusicTrait, string>> = {
  ko: {
    mellow: '감성',
    unpretentious: '편안함',
    sophisticated: '탐구성',
    intense: '강렬함',
    contemporary: '트렌드',
  },
  en: {
    mellow: 'Mellow',
    unpretentious: 'Easygoing',
    sophisticated: 'Sophisticated',
    intense: 'Intense',
    contemporary: 'Contemporary',
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

export function createComparisonHash(hostScores: MUSICPersonality, guestScores?: MUSICPersonality | null) {
  const params = new URLSearchParams({ compare: encodeScores(hostScores) });
  if (guestScores) params.set('guest', encodeScores(guestScores));
  return params.toString();
}

export function parseComparisonHash(hash: string) {
  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(normalized);
  const hostScores = decodeScores(params.get('compare'));
  if (!hostScores) return null;
  return { hostScores, guestScores: decodeScores(params.get('guest')) };
}

export function getComparisonUrl(hostScores: MUSICPersonality, guestScores?: MUSICPersonality | null, language: 'ko' | 'en' = 'ko') {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams({ host: encodeScores(hostScores) });
  if (guestScores) params.set('guest', encodeScores(guestScores));
  if (language === 'en') params.set('lang', 'en');
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
  language: 'ko' | 'en',
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

  if (language === 'ko') {
    if (score >= 88) return { score, traits, strongest, biggestDifference, title: '거의 같은 플레이리스트', description: `${strongest.label} 취향이 특히 닮았어요. 말없이 음악만 틀어도 금방 통할 조합입니다.` };
    if (score >= 74) return { score, traits, strongest, biggestDifference, title: '같이 들을수록 좋은 사이', description: `${strongest.label}에서 가장 잘 통하고, ${biggestDifference.label}의 차이는 서로의 플레이리스트를 넓혀줘요.` };
    if (score >= 60) return { score, traits, strongest, biggestDifference, title: '닮음과 새로움의 균형', description: `${strongest.label}은 편안하게 통하고, ${biggestDifference.label}은 서로에게 새로운 음악을 건넬 포인트예요.` };
    return { score, traits, strongest, biggestDifference, title: '서로 다른 취향의 발견', description: `차이가 큰 만큼 함께 들으면 새로운 장르를 발견할 가능성이 커요. ${strongest.label}이 두 취향을 잇는 접점입니다.` };
  }

  if (score >= 88) return { score, traits, strongest, biggestDifference, title: 'Almost the same playlist', description: `You especially align on ${strongest.label}. Music is likely to click before words do.` };
  if (score >= 74) return { score, traits, strongest, biggestDifference, title: 'Better when listening together', description: `${strongest.label} connects you most, while your ${biggestDifference.label} gap can broaden both playlists.` };
  if (score >= 60) return { score, traits, strongest, biggestDifference, title: 'A balance of familiar and new', description: `${strongest.label} feels natural together, and ${biggestDifference.label} gives you something new to share.` };
  return { score, traits, strongest, biggestDifference, title: 'A meeting of different tastes', description: `Your differences make room for discovery. ${strongest.label} is the bridge between your playlists.` };
}
