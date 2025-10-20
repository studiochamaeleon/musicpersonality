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
      "url": "https://musicpersonalitytest.pages.dev",
      "name": getLocalizedText('Music Personality Test', '음악 성격 테스트'),
      "description": getLocalizedText(
        'Comprehensive music personality assessment based on the MUSIC model',
        'MUSIC 모델 기반 포괄적인 음악 성격 평가'
      ),
      "publisher": {
        "@type": "Organization",
        "name": getLocalizedText('Music Personality Research', '음악 성격 연구소'),
        "url": "https://musicpersonalitytest.pages.dev",
        "logo": {
          "@type": "ImageObject",
          "url": "https://musicpersonalitytest.pages.dev/favicon-64x64.png",
          "width": 64,
          "height": 64
        }
      }
    };

    switch (type) {
      case 'website':
        return {
          ...baseData,
          "image": {
            "@type": "ImageObject",
            "url": "https://musicpersonalitytest.pages.dev/favicon-64x64.png",
            "width": 64,
            "height": 64
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://musicpersonalitytest.pages.dev/search?q={search_term_string}",
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
          "teaches": getLocalizedText(
            'Understanding personal music preferences and personality traits through the MUSIC model',
            'MUSIC 모델을 통한 개인 음악 선호도 및 성격 특성 이해'
          ),
          "assesses": getLocalizedText(
            'Musical preferences across five dimensions: Mellow, Unpretentious, Sophisticated, Intense, and Contemporary',
            '다섯 차원의 음악적 선호도: 부드러움, 솔직함, 세련됨, 강렬함, 현대성'
          ),
          "hasPart": [
            {
              "@type": "Question",
              "name": getLocalizedText('Mellow Dimension Assessment', '부드러움 차원 평가'),
              "text": getLocalizedText(
                'Questions about preference for soft, romantic, and slow music',
                '부드럽고 로맨틱하며 느린 음악에 대한 선호도 질문'
              )
            },
            {
              "@type": "Question", 
              "name": getLocalizedText('Unpretentious Dimension Assessment', '솔직함 차원 평가'),
              "text": getLocalizedText(
                'Questions about preference for uncomplicated, relaxing music',
                '복잡하지 않고 편안한 음악에 대한 선호도 질문'
              )
            },
            {
              "@type": "Question",
              "name": getLocalizedText('Sophisticated Dimension Assessment', '세련됨 차원 평가'), 
              "text": getLocalizedText(
                'Questions about preference for complex, intelligent music',
                '복잡하고 지적인 음악에 대한 선호도 질문'
              )
            },
            {
              "@type": "Question",
              "name": getLocalizedText('Intense Dimension Assessment', '강렬함 차원 평가'),
              "text": getLocalizedText(
                'Questions about preference for distorted, loud, and aggressive music',
                '일그러지고 큰 소리의 공격적인 음악에 대한 선호도 질문'
              )
            },
            {
              "@type": "Question",
              "name": getLocalizedText('Contemporary Dimension Assessment', '현대성 차원 평가'),
              "text": getLocalizedText(
                'Questions about preference for rap, electronica, and modern music',
                '랩, 일렉트로니카, 현대 음악에 대한 선호도 질문'
              )
            }
          ],
          "numberOfQuestions": 25,
          "timeRequired": "PT5M",
          "totalTime": "PT5M",
          "isAccessibleForFree": true,
          "inLanguage": language === 'ko' ? 'ko' : 'en',
          "audience": {
            "@type": "Audience",
            "audienceType": getLocalizedText('Music enthusiasts', '음악 애호가')
          },
          "typicalAgeRange": "13-99",
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
            "@id": "https://musicpersonalitytest.pages.dev"
          },
          "image": {
            "@type": "ImageObject",
            "url": "https://musicpersonalitytest.pages.dev/og-image.jpg",
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