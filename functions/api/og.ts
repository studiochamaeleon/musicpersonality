import { calculateMatchScore, decodeScoreToken } from '../../cloudflare/sharePayload';
import { createOgPng } from '../../cloudflare/ogImage';

interface PagesFunctionContext {
  request: Request;
}

export async function onRequest(context: PagesFunctionContext) {
  const requestUrl = new URL(context.request.url);
  const hostScores = decodeScoreToken(requestUrl.searchParams.get('host'));
  const guestToken = requestUrl.searchParams.get('guest');
  const guestScores = guestToken ? decodeScoreToken(guestToken) : null;

  if (!hostScores || (guestToken && !guestScores)) {
    return new Response('Invalid score payload', { status: 400 });
  }

  const matchScore = guestScores ? calculateMatchScore(hostScores, guestScores) : null;
  const image = createOgPng(hostScores, matchScore);
  return new Response(image, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-disposition': 'inline; filename="music-match.png"',
      'x-content-type-options': 'nosniff',
    },
  });
}
