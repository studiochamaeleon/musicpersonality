import React from 'react';
import { SITE_URL } from '@/lib/siteUrl';

export default function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: '음악 성격 테스트',
    alternateName: ['Music Personality Test', '音楽性格テスト'],
    description: '40문항의 가벼운 음악 취향 테스트로 나와 닮은 장르와 앨범을 발견해보세요.',
    publisher: { '@type': 'Organization', name: 'CHAMELEONS' },
    inLanguage: ['ko', 'en', 'ja'],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
