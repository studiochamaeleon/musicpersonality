# Genre exploration: six album gateways

Reviewed 2026-10-05.

## Scope

- Every one of the 34 existing genres displays six distinct artists and albums: 204 genre-to-album references.
- Added 109 album-only references in `src/data/genreExplorerAlbums.json`; reuse the original genre cornerstones, discoveries and crossover references.
- Personal result and friend compatibility catalogues, scoring, rankings and track recommendations are unchanged. Exploration data is loaded with the lazy genre explorer, not the initial home screen.
- Existing visual style and responsive one/two-column album cards are retained. Search includes supplementary artist names, Korean names, album titles and recording credits.
- Search matches are retained in the six-card display, with the cornerstone first. J-pop filters select compatible genres and prioritize the Japanese scene reference; they do not imply that every artist in that genre is Japanese.

## Editorial choices

Preserve historical cornerstones and modern entries already in the core catalogue. Fill the remaining slots with approachable, sonically connected albums, rather than six releases from a single artist or only recent chart entries.

Examples: Radiohead, Pearl Jam, Pixies and Wolf Alice for alternative rock; Disclosure, Justice and Peggy Gou for house; Slowdive and Mazzy Star for dream pop; A Tribe Called Quest, Public Enemy and De La Soul for old-school hip-hop. Subgenres overlap: these are editorial listening gateways, not an assertion that an artist's entire discography belongs exclusively to one genre.

Years refer to original releases where appropriate, and to recordings/releases for classical selections—not composer lifetimes. Classical credits preserve the performers. Spotify titles and direct album URLs are retained verbatim.

## Verification

Final local verification: production build, lint, TypeScript and catalog validation passed; all 101 unit tests passed; 36 targeted mobile Chromium/WebKit tests passed on the rebuilt preview (including every genre and all three languages).

- `npm run validate:catalog` checks six entries per genre, names, roles, years, direct Spotify album URL format and duplicates.
- `tests/unit/genreExplorerAlbums.test.mjs` covers all 34 genres, every supplementary search term, scene behavior, immutable personal recommendations and duplicate suppression.
- `tests/e2e/genre-explorer-albums.spec.ts` covers every genre's six cards plus Korean/English/Japanese at 320px, all six listening links, search and J-pop scene filtering.
- `node scripts/audit-explorer-albums.mjs --report=/private/tmp/muti-explorer-album-audit-final.json` independently fetched all 109 supplementary Spotify embed pages: zero title/artist/link metadata failures in the final audit.
- Fully country-restricted King Crimson/Jeff Mills editions found during the first audit were replaced with an accessible King Crimson edition and Carl Craig's gateway album.

Public preview availability is not full playback entitlement. Five trap/neo-soul albums require age verification in the unauthenticated preview; some other album editions have individually restricted tracks. Playback can vary by region, account, age verification and subscription. The app links out to Spotify; it does not call Spotify APIs or embed an audio player at runtime.

No commit, push or production deployment is included.
