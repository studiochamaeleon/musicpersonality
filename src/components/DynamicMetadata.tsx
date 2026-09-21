'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DynamicMetadata() {
  const { language } = useLanguage();

  useEffect(() => {
    const getLocalizedText = (enText: string, koText: string) => {
      return language === 'ko' ? koText : enText;
    };

    // Update document title
    document.title = getLocalizedText(
      'Music Personality Test - Discover Your Musical Identity',
      '음악 성격 테스트 | 나와 닮은 장르 찾기'
    );

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', getLocalizedText(
        'A lighthearted music taste test inspired by the MUSIC model. Discover a genre, artists and albums that sound like you.',
        '음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요. MUSIC 모델에서 영감을 받은 가벼운 테스트입니다.'
      ));
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', getLocalizedText(
        'Music Personality Test - Discover Your Musical Identity',
        '음악 성격 테스트 | 나와 닮은 장르 찾기'
      ));
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', getLocalizedText(
        'Take a lighthearted music taste test and discover genres and albums that sound like you.',
        '음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요.'
      ));
    }

    // Update Open Graph site name
    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) {
      ogSiteName.setAttribute('content', getLocalizedText(
        'Music Personality Test',
        '음악 성격 테스트'
      ));
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', getLocalizedText(
        'Music Personality Test - Discover Your Musical Identity',
        '음악 성격 테스트 | 나와 닮은 장르 찾기'
      ));
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', getLocalizedText(
        'Take a lighthearted music taste test and discover genres and albums that sound like you.',
        '음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요.'
      ));
    }

    // Update Open Graph locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute('content', language === 'ko' ? 'ko_KR' : 'en_US');
    }

  }, [language]);

  return null;
}
