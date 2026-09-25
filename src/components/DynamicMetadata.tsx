'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DynamicMetadata() {
  const { language } = useLanguage();

  useEffect(() => {
    const getLocalizedText = (enText: string, koText: string, jaText: string) => {
      return language === 'ko' ? koText : language === 'ja' ? jaText : enText;
    };
    const pathname = window.location.pathname.replace(/\/$/, '') || '/';
    const legalPage = pathname === '/privacy' ? 'privacy' : pathname === '/terms' ? 'terms' : null;
    const legalTitle = legalPage === 'privacy'
      ? getLocalizedText('Privacy Policy | MUTI', '개인정보 보호정책 | MUTI', 'プライバシーポリシー | MUTI')
      : legalPage === 'terms'
        ? getLocalizedText('Terms of Service | MUTI', '이용약관 | MUTI', '利用規約 | MUTI')
        : null;
    const legalDescription = legalPage === 'privacy'
      ? getLocalizedText('How MUTI handles local data, sharing links and third-party services.', 'MUTI의 로컬 데이터, 공유 링크 및 제3자 서비스 이용 안내입니다.', 'MUTIのローカルデータ、共有リンク、第三者サービスについてのご案内です。')
      : legalPage === 'terms'
        ? getLocalizedText('Terms for using the MUTI music taste test.', 'MUTI 음악 취향 테스트의 서비스 이용 조건입니다.', 'MUTI音楽の好みテストの利用規約です。')
        : null;

    // Update document title
    document.title = legalTitle || getLocalizedText(
      'MUTI | Music Taste Identity',
      'MUTI | 나와 닮은 음악 찾기',
      'MUTI | 自分に似た音楽を見つけよう'
    );

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', legalDescription || getLocalizedText(
        'A lighthearted music taste test inspired by the MUSIC model. Discover a genre, artists and albums that sound like you.',
        '음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요. MUSIC 모델에서 영감을 받은 가벼운 테스트입니다.',
        '音楽の好みに答えて、自分に似たジャンルとアルバムを見つけるライトな性格テストです。'
      ));
    }

    // Update Open Graph title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', legalTitle || getLocalizedText(
        'MUTI | Music Taste Identity',
        'MUTI | 나와 닮은 음악 찾기',
        'MUTI | 自分に似た音楽を見つけよう'
      ));
    }

    // Update Open Graph description
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', legalDescription || getLocalizedText(
        'Take a lighthearted music taste test and discover genres and albums that sound like you.',
        '음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요.',
        '音楽の好みから、あなたに似たジャンルとアルバムを見つけよう。'
      ));
    }

    // Update Open Graph site name
    const ogSiteName = document.querySelector('meta[property="og:site_name"]');
    if (ogSiteName) {
      ogSiteName.setAttribute('content', 'MUTI');
    }

    // Update Twitter title
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', legalTitle || getLocalizedText(
        'MUTI | Music Taste Identity',
        'MUTI | 나와 닮은 음악 찾기',
        'MUTI | 自分に似た音楽を見つけよう'
      ));
    }

    // Update Twitter description
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', legalDescription || getLocalizedText(
        'Take a lighthearted music taste test and discover genres and albums that sound like you.',
        '음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요.',
        '音楽の好みから、あなたに似たジャンルとアルバムを見つけよう。'
      ));
    }

    // Update Open Graph locale
    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) {
      ogLocale.setAttribute('content', language === 'ko' ? 'ko_KR' : language === 'ja' ? 'ja_JP' : 'en_US');
    }

  }, [language]);

  return null;
}
