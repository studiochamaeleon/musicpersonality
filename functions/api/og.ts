import { calculateMatchScore, decodeScoreToken } from '../../cloudflare/sharePayload';
import { createOgPng } from '../../cloudflare/ogImage';
import { getPersonalResultSummary } from '../../cloudflare/personalResult';

interface PagesFunctionContext {
  request: Request;
}

export async function onRequest(context: PagesFunctionContext) {
  const requestUrl = new URL(context.request.url);
  const resultScores = decodeScoreToken(requestUrl.searchParams.get('score'));
  if (resultScores) {
    const result = getPersonalResultSummary(resultScores);
    const image = createOgPng(resultScores, null, {
      genreName: result.genreName,
      compatibility: result.compatibility,
    });
    return pngResponse(image, 'music-personality-result.png');
  }

  const hostScores = decodeScoreToken(requestUrl.searchParams.get('host'));
  const guestToken = requestUrl.searchParams.get('guest');
  const guestScores = guestToken ? decodeScoreToken(guestToken) : null;

  if (!hostScores || (guestToken && !guestScores)) {
    return new Response('Invalid score payload', { status: 400 });
  }

  const matchScore = guestScores ? calculateMatchScore(hostScores, guestScores) : null;
  const image = createOgPng(hostScores, matchScore);
  return pngResponse(image, 'music-match.png');
}

function pngResponse(image: Uint8Array, filename: string) {
  return new Response(image.buffer as ArrayBuffer, {
    headers: {
      'content-type': 'image/png',
      'cache-control': 'public, max-age=31536000, immutable',
      'content-disposition': `inline; filename="${filename}"`,
      'x-content-type-options': 'nosniff',
    },
  });
}
