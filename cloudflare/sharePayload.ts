export const SCORE_TOKEN_PATTERN = /^v1(?:\.(?:100|[0-9]{1,2})){5}$/;

export function decodeScoreToken(token: string | null) {
  if (!token || !SCORE_TOKEN_PATTERN.test(token)) return null;
  const values = token.split('.').slice(1).map(Number);
  return values.length === 5 ? values : null;
}

export function calculateMatchScore(host: number[], guest: number[]) {
  const totalSimilarity = host.reduce((sum, score, index) => sum + 100 - Math.abs(score - guest[index]), 0);
  return Math.round(totalSimilarity / host.length);
}

export function createAppHash(host: string, guest?: string | null) {
  const params = new URLSearchParams({ compare: host });
  if (guest) params.set('guest', guest);
  return `/#${params.toString()}`;
}
