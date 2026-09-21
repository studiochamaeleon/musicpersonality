# Music Personality

음악 취향 40문항을 통해 MUSIC 5요인 점수를 계산하고, 닮은 장르·아티스트·입문 앨범·성격 해석을 보여주는 가벼운 바이럴 웹 테스트입니다. 한국어와 영어를 지원하며 별도 계정이나 백엔드 없이 정적 사이트로 동작합니다.

## 주요 흐름

- 개인 테스트: 설문 → MUSIC 점수 → 장르·아티스트·입문 앨범·성격 결과
- 친구 궁합: 내 결과 → 초대 링크 → 친구 테스트 → 2인 취향 비교
- 공유: 개인 결과 카드와 2인 궁합 카드를 이미지 또는 결과별 동적 미리보기 링크로 공유
- 탐색: 설문 없이 32개 장르의 성향과 대표 음악 확인
- 최근 결과: 브라우저에 최근 결과를 최대 3개까지 저장

## 친구 궁합 데이터 방식

친구 궁합에는 데이터베이스를 사용하지 않습니다. MUSIC 점수는 URL fragment에 버전이 포함된 압축 형태로 저장됩니다.

```text
#compare=v1.82.46.74.31.68
#compare=v1.82.46.74.31.68&guest=v1.70.61.79.48.75
```

친구 궁합의 앱 내부 결과는 URL fragment로 복원하며 이름, 이메일 같은 개인 식별 정보는 링크에 포함하지 않습니다. 실제 공유 링크는 `/share?host=...&guest=...` 형태로 발급됩니다. 개인 결과는 `/result?score=v1...&sv=2&lang=ko`를 사용합니다. 두 공유 경로는 Cloudflare Pages Function을 거쳐 결과별 SNS 미리보기 카드와 메타데이터를 제공한 뒤 브라우저를 앱 결과로 이동시킵니다.

## 점수 해석

- 각 5점 응답을 0–100으로 바꾸고 역문항을 뒤집은 다음, 문항 가중치 합으로 나누어 MUSIC 다섯 점수를 계산합니다. 현재는 성향마다 8문항입니다.
- 장르 추천은 자기보고 MUSIC 점수와 정적으로 작성된 장르 프로필을 비교합니다. 코사인 유사도 60%와 정규화한 유클리드 유사도 40%를 결합하고, 화면에는 15–95 범위의 **장르 유사도 지수**로 표시합니다. 이는 해당 음악을 좋아할 확률이나 통계적 신뢰도가 아닙니다.
- 반올림된 표시 점수가 같아도 실제 유사도가 높은 장르가 먼저 나옵니다. 브라우저와 Cloudflare의 공유 미리보기는 같은 점수·정렬 함수를 사용합니다.
- 인기도·에너지·긍정성·어쿠스틱 값과 성격 해석은 추천 장르의 편집 프로필이지 사용자 개인 점수가 아닙니다. 학술적 신뢰도·타당도가 검증된 성격 진단으로 소개하지 않습니다.

## 기술 구성

- Next.js 15 / React 19 / TypeScript
- Tailwind CSS 4 / Framer Motion / Recharts
- `html-to-image` 기반 공유 이미지 및 iOS 파일 공유 시트 지원
- Cloudflare Pages Functions 기반 동적 SNS 미리보기 카드
- 개인 결과의 장르·타입명·일치율을 반영하는 전용 Open Graph 이미지
- Node 단위 테스트와 Playwright 모바일 E2E 테스트
- 정적 JSON 기반 질문·장르 데이터
- 32개 장르, 64개 검수 앨범으로 구성된 정적 음악 카탈로그
- 런타임 API 호출 없는 Spotify 직접 앨범 링크
- 정적 export 및 PWA 지원

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 검증 및 빌드

```bash
npm run lint
npm run test:unit
npm run validate:catalog
npm run build
npm run test:e2e
```

`npm run build`는 정적 결과물을 `out/`에 생성합니다.

`npm run validate:catalog`는 모든 장르에 `anchor`와 `discovery` 앨범이 있는지, Spotify 앨범 URL 형식과 중복 여부가 올바른지 확인합니다. 카탈로그는 `src/data/musicCatalog.json`에서 관리하며 Spotify Web API나 사용자 로그인을 사용하지 않습니다.

`npm run test:unit`는 역채점·가중 평균·점수 범위·동점 정렬과 32개 장르의 한영 결과 콘텐츠 완전성을 검증합니다.

`npm run test:e2e`는 정적 빌드와 Cloudflare Pages Functions를 함께 실행해 다음 흐름을 모바일 Chromium에서 검증합니다.

- 친구 초대에서 40문항 완료 후 궁합 결과 표시
- 궁합 결과 링크 및 개인 결과 복원
- 개인·궁합 결과 카드의 PNG 저장
- 동적 Open Graph 메타데이터와 1200×630 이미지
- 설문 자동 진행·답변 수정, 결과 본문 완전성, 장르 상세의 키보드 조작

Pull Request와 `main` 브랜치 push에서도 같은 E2E 검증이 GitHub Actions로 자동 실행됩니다.

## Cloudflare Pages 배포

- Build command: `npm run build`
- Build output directory: `out`
- Functions: 저장소의 `functions/` 디렉터리에서 자동 배포
- Function routes: `/share`, `/result`, `/api/og`만 `public/_routes.json`에 포함

나머지 앱과 정적 자산은 Pages에서 그대로 제공되므로 데이터베이스나 별도 이미지 렌더링 서비스가 필요하지 않습니다.

## 데이터와 개인정보

- 설문 계산과 추천은 모두 브라우저에서 처리됩니다.
- 최근 결과와 자체 이벤트 기록은 브라우저 `localStorage`에만 저장됩니다.
- 서비스는 계정·결과 데이터베이스를 사용하지 않습니다. 다만 SNS 미리보기용 공유 링크를 열면 MUSIC 점수가 URL 쿼리에 포함되어 Cloudflare Pages Function과 링크를 받은 서비스에 전달될 수 있습니다. 공유 전 이 점을 확인해야 합니다.
- 광고가 활성화된 배포에서는 Google AdSense의 별도 데이터 정책이 적용될 수 있습니다.

이 테스트는 음악 심리학 모델에서 영감을 받은 엔터테인먼트 콘텐츠이며 의료·임상 진단 도구가 아닙니다.
