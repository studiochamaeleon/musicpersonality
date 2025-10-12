import React from 'react';

interface StructuredDataProps {
  type: 'website' | 'quiz' | 'article';
  data?: Record<string, unknown>;
}

interface LocalizedStructuredDataProps extends StructuredDataProps {
  language?: 'en' | 'ko';
}

const StructuredData: React.FC<LocalizedStructuredDataProps> = ({ type, data = {}, language = 'en' }) => {
  const getLocalizedText = (enText: string, koText: string) => {
    return language === 'ko' ? koText : enText;
  };
  
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'website' ? "WebSite" : type === 'quiz' ? "Quiz" : "Article",
      "url": "https://music-personality-test.vercel.app",
      "name": getLocalizedText('Music Personality Test', '음악 성격 테스트'),
      "description": getLocalizedText(
        'Comprehensive music personality assessment based on the MUSIC model',
        'MUSIC 모델 기반 포괄적인 음악 성격 평가'
      ),
      "publisher": {
        "@type": "Organization",
        "name": getLocalizedText('Music Personality Research', '음악 성격 연구소'),
        "url": "https://music-personality-test.vercel.app"
      }
    };

    switch (type) {
      case 'website':
        return {
          ...baseData,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://music-personality-test.vercel.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };

      case 'quiz':
        return {
          ...baseData,
          "@type": "Quiz",
          "educationalLevel": getLocalizedText('General', '일반'),
          "learningResourceType": getLocalizedText('Assessment', '평가'),
          "about": {
            "@type": "Thing",
            "name": getLocalizedText('Music Psychology', '음악 심리학'),
            "description": getLocalizedText('MUSIC model personality assessment', 'MUSIC 모델 성격 평가')
          },
          "hasPart": [
            {
              "@type": "Question",
              "name": getLocalizedText('Music Preference Questions', '음악 선호도 질문'),
              "text": getLocalizedText(
                'Questions about musical preferences and listening habits',
                '음악적 선호도와 청취 습관에 관한 질문'
              )
            }
          ],
          "totalTime": "PT5M",
          "isAccessibleForFree": true,
          ...data
        };

      case 'article':
        return {
          ...baseData,
          "@type": "Article",
          "headline": data.headline || getLocalizedText('Understanding Your Music Personality', '당신의 음악 성격 이해하기'),
          "author": {
            "@type": "Organization",
            "name": getLocalizedText('Music Personality Research', '음악 성격 연구소')
          },
          "datePublished": data.datePublished || new Date().toISOString(),
          "dateModified": data.dateModified || new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://music-personality-test.vercel.app"
          },
          "image": {
            "@type": "ImageObject",
            "url": "https://music-personality-test.vercel.app/og-image.jpg",
            "width": 1200,
            "height": 630
          },
          ...data
        };

      default:
        return baseData;
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(getStructuredData())
      }}
    />
  );
};

export default StructuredData;