import React from 'react';
import { SITE_URL } from '@/lib/siteUrl';

export default function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'MUTI',
    alternateName: ['Music Taste Identity', 'MUTI 음악 취향 테스트', 'MUTI 音楽の好みテスト'],
    description: '40문항의 가벼운 음악 취향 테스트로 나와 닮은 장르와 앨범을 발견해보세요.',
    publisher: { '@type': 'Organization', name: 'CHAMELEONS' },
    inLanguage: ['ko', 'en', 'ja'],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
