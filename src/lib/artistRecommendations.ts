import type { ArtistReference, MusicCatalog, RecommendedArtist } from '../types/index.ts';

export interface ArtistPickCandidate {
  artist: ArtistReference;
  genreId: string;
  compatibility: number;
}

export interface ArtistPickSlot extends ArtistPickCandidate {
  alternatives: ArtistPickCandidate[];
}

type RankedGenre = { genreId: string; compatibility: number };

function artistKey(artist: ArtistReference): string {
  return artist.name.normalize('NFKC').trim().toLocaleLowerCase('en');
}

function usable(artist: ArtistReference): boolean {
  return Boolean(artist.name?.trim()) && /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/.test(artist.track?.spotifyUrl || '');
}

function conflicts(artist: ArtistReference, others: { artist: ArtistReference }[]): boolean {
  return others.some(other => artistKey(other.artist) === artistKey(artist)
    || other.artist.track.spotifyUrl === artist.track.spotifyUrl);
}

function uniqueCandidates(candidates: ArtistPickCandidate[]): ArtistPickCandidate[] {
  const unique: ArtistPickCandidate[] = [];
  for (const candidate of candidates) {
    if (usable(candidate.artist) && !conflicts(candidate.artist, unique)) unique.push(candidate);
  }
  return unique;
}

/** Small, stable slots: one cornerstone, discoveries from up to three genres, one scene bridge. */
export function planArtistRecommendations(
  rankings: RankedGenre[],
  catalog: MusicCatalog,
  requestedLimit = 6,
): ArtistPickSlot[] {
  const limit = Number.isFinite(requestedLimit) ? Math.max(0, Math.min(6, Math.floor(requestedLimit))) : 6;
  const nearby = rankings.filter((rank, index) => rankings.findIndex(other => other.genreId === rank.genreId) === index).slice(0, 3);
  const slots: ArtistPickSlot[] = [];
  const addSlot = (candidates: ArtistPickCandidate[], allowAlternatives = true) => {
    if (slots.length >= limit) return;
    const alternatives = uniqueCandidates(candidates);
    const selected = alternatives.find(candidate => !conflicts(candidate.artist, slots));
    if (selected) slots.push({ ...selected, alternatives: allowAlternatives ? alternatives : [] });
  };

  nearby.forEach((rank, index) => {
    const candidates = (catalog.genres[rank.genreId] || []).map(artist => ({ artist, genreId: rank.genreId, compatibility: rank.compatibility }));
    if (index === 0) addSlot(candidates.filter(candidate => candidate.artist.role === 'anchor'), false);
    const discoveries = candidates.filter(candidate => candidate.artist.role === 'discovery');
    // Offer a recent discovery alongside the historical cornerstone where one
    // exists. Release year is an editorial ordering choice, not liking confidence.
    const recent = discoveries.filter(candidate => candidate.artist.track.year >= 2020);
    addSlot([...recent, ...discoveries.filter(candidate => candidate.artist.track.year < 2020)]);
  });

  addSlot(nearby.flatMap(rank => (catalog.crossovers || [])
    .filter(artist => artist.role === 'bridge' && artist.genreIds.includes(rank.genreId))
    .map(artist => ({ artist, genreId: rank.genreId, compatibility: rank.compatibility }))));
  return slots;
}

/** Only alternatives that cannot duplicate another visible artist or track. */
export function artistRecommendationAlternatives(picks: RecommendedArtist[], index: number): RecommendedArtist[] {
  const current = picks[index];
  if (!current || current.artist.role === 'anchor') return [];
  const others = picks.filter((_, position) => position !== index);
  const candidates = [current, ...(current.alternatives || [])];
  const available: RecommendedArtist[] = [];
  for (const candidate of candidates) {
    if (candidate.artist.role !== current.artist.role || !usable(candidate.artist)
      || conflicts(candidate.artist, others) || conflicts(candidate.artist, available)) continue;
    available.push(candidate);
  }
  // Preserve editorial candidate order across successive clicks.
  const ordered = current.alternatives || [];
  return available.sort((first, second) => {
    const firstIndex = ordered.findIndex(candidate => candidate.artist.track.spotifyUrl === first.artist.track.spotifyUrl);
    const secondIndex = ordered.findIndex(candidate => candidate.artist.track.spotifyUrl === second.artist.track.spotifyUrl);
    return firstIndex - secondIndex;
  });
}

export function rotateArtistRecommendation(picks: RecommendedArtist[], index: number): RecommendedArtist[] {
  const current = picks[index];
  const alternatives = artistRecommendationAlternatives(picks, index);
  if (!current || alternatives.length < 2) return picks;
  const currentIndex = alternatives.findIndex(candidate => candidate.artist.track.spotifyUrl === current.artist.track.spotifyUrl);
  const next = alternatives[(currentIndex + 1) % alternatives.length];
  return picks.map((pick, position) => position === index ? { ...next, alternatives: current.alternatives } : pick);
}
