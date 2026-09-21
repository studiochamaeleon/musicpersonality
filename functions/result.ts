import { decodeScoreToken } from '../cloudflare/sharePayload';
import { createResultAppPath, getPersonalResultSummary } from '../cloudflare/personalResult';

interface PagesFunctionContext {
  request: Request;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

export async function onRequest(context: PagesFunctionContext) {
  const requestUrl = new URL(context.request.url);
  const scoreToken = requestUrl.searchParams.get('score');
  const scores = decodeScoreToken(scoreToken);
  const language = requestUrl.searchParams.get('lang') === 'en' ? 'en' : 'ko';

  if (!scoreToken || !scores) return new Response('Invalid music result link', { status: 400 });

  const result = getPersonalResultSummary(scores);
  const title = language === 'ko'
    ? `내 음악 성격은 ${result.typeTitleKo} · ${result.genreNameKo}`
    : `My music personality is ${result.typeTitleEn} · ${result.genreName}`;
  const description = language === 'ko'
    ? `장르 유사도 ${result.compatibility}% · ${result.characteristics.join(', ')}. 당신의 음악 성격도 확인해보세요.`
    : `${result.compatibility}% genre similarity. Discover your music personality and compare it with a friend.`;
  const imageParams = new URLSearchParams({ score: scoreToken });
  if (requestUrl.searchParams.get('sv') === '2') imageParams.set('sv', '2');
  if (language === 'en') imageParams.set('lang', 'en');
  const imageUrl = `${requestUrl.origin}/api/og?${imageParams.toString()}`;
  const destination = createResultAppPath(scores, language);

  const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)} | Music Personality</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Music Personality" />
  <meta property="og:locale" content="${language === 'ko' ? 'ko_KR' : 'en_US'}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <link rel="canonical" href="${escapeHtml(requestUrl.toString())}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(destination)}" />
  <style>html{background:#07080a;color:#fff;font-family:system-ui,sans-serif}body{min-height:100vh;display:grid;place-items:center;margin:0}a{color:#c8ff3d}</style>
</head>
<body>
  <p>${language === 'ko' ? '음악 성격 결과를 여는 중입니다.' : 'Opening your music personality result.'} <a href="${escapeHtml(destination)}">${language === 'ko' ? '바로 열기' : 'Open now'}</a></p>
  <script>window.location.replace(${JSON.stringify(destination)});</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'public, max-age=300',
      'x-content-type-options': 'nosniff',
    },
  });
}
