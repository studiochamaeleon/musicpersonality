import { calculateMatchScore, createAppHash, decodeScoreToken } from '../cloudflare/sharePayload';

interface PagesFunctionContext {
  request: Request;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
}

export async function onRequest(context: PagesFunctionContext) {
  const requestUrl = new URL(context.request.url);
  const hostToken = requestUrl.searchParams.get('host');
  const guestToken = requestUrl.searchParams.get('guest');
  const hostScores = decodeScoreToken(hostToken);
  const guestScores = guestToken ? decodeScoreToken(guestToken) : null;
  const language = requestUrl.searchParams.get('lang') === 'ja' ? 'ja' : requestUrl.searchParams.get('lang') === 'en' ? 'en' : 'ko';

  if (!hostToken || !hostScores || (guestToken && !guestScores)) {
    return new Response('Invalid music match link', { status: 400 });
  }

  const score = guestScores ? calculateMatchScore(hostScores, guestScores) : null;
  const title = language === 'en'
    ? score === null ? 'A friend is waiting to compare music tastes' : `Our music match is ${score}%`
    : language === 'ja' ? score === null ? '友達が音楽相性を待っています' : `二人の音楽相性は${score}％`
      : score === null ? '친구가 음악 궁합을 기다리고 있어요' : `우리 음악 궁합은 ${score}%`;
  const description = language === 'en'
    ? score === null ? 'Take a quick music taste test and compare your MUSIC profiles.' : 'Discover where your tastes align, differ, and what to listen to together.'
    : language === 'ja' ? score === null ? 'かんたんな音楽の好みテストで、二人のMUSICプロファイルを比べよう。' : '似ている好み、違う好み、一緒に聴きたいジャンルを見つけよう。'
      : score === null ? '간단한 음악 취향 검사를 하고 두 사람의 MUSIC 성향을 비교해보세요.' : '닮은 취향과 다른 취향, 함께 들으면 좋은 장르를 확인해보세요.';
  const imageParams = new URLSearchParams({ host: hostToken });
  if (guestToken) imageParams.set('guest', guestToken);
  if (language !== 'ko') imageParams.set('lang', language);
  const imageUrl = `${requestUrl.origin}/api/og?${imageParams.toString()}`;
  const destination = createAppHash(hostToken, guestToken, language);

  const html = `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)} | MUTI</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="MUTI" />
  <meta property="og:locale" content="${language === 'ko' ? 'ko_KR' : language === 'ja' ? 'ja_JP' : 'en_US'}" />
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
  <meta name="robots" content="noindex,follow" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(destination)}" />
  <style>html{background:#07080a;color:#fff;font-family:system-ui,sans-serif}body{min-height:100vh;display:grid;place-items:center;margin:0}a{color:#c8ff3d}</style>
</head>
<body>
  <p>${language === 'en' ? 'Opening your music match.' : language === 'ja' ? '音楽相性を開いています。' : '음악 궁합 결과를 여는 중입니다.'} <a href="${escapeHtml(destination)}">${language === 'en' ? 'Open now' : language === 'ja' ? '今すぐ開く' : '바로 열기'}</a></p>
  <script>window.location.replace(${JSON.stringify(destination)});</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'public, max-age=300',
      'x-content-type-options': 'nosniff',
      'x-robots-tag': 'noindex, follow',
    },
  });
}
