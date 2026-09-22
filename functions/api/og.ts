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
    const language = requestUrl.searchParams.get('lang') === 'ja' ? 'ja' : requestUrl.searchParams.get('lang') === 'en' ? 'en' : 'ko';
    const image = createOgPng(resultScores, null, {
      genreName: language === 'ko' ? result.genreNameKo : language === 'ja' ? result.genreNameJa : result.genreName,
      typeTitle: language === 'ko' ? result.typeTitleKo : language === 'ja' ? result.typeTitleJa : result.typeTitleEn,
      compatibility: result.compatibility,
    }, language);
    return pngResponse(image, `music-personality-result-${language}.png`, 'public, max-age=86400');
  }

  const hostScores = decodeScoreToken(requestUrl.searchParams.get('host'));
  const guestToken = requestUrl.searchParams.get('guest');
  const guestScores = guestToken ? decodeScoreToken(guestToken) : null;

  if (!hostScores || (guestToken && !guestScores)) {
    return new Response('Invalid score payload', { status: 400 });
  }

  const matchScore = guestScores ? calculateMatchScore(hostScores, guestScores) : null;
  const language = requestUrl.searchParams.get('lang') === 'ja' ? 'ja' : requestUrl.searchParams.get('lang') === 'en' ? 'en' : 'ko';
  const image = createOgPng(hostScores, matchScore, undefined, language);
  return pngResponse(image, 'music-match.png');
}

function pngResponse(image: Uint8Array, filename: string, cacheControl = 'public, max-age=31536000, immutable') {
  return new Response(image.buffer as ArrayBuffer, {
    headers: {
      'content-type': 'image/png',
      'cache-control': cacheControl,
      'content-disposition': `inline; filename="${filename}"`,
      'x-content-type-options': 'nosniff',
    },
  });
}
