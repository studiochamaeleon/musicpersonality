'use client';

import React from 'react';

interface StructuredDataProps {
  type: 'website' | 'quiz' | 'article';
  data?: Record<string, unknown>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data = {} }) => {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
      "@type": type === 'website' ? "WebSite" : type === 'quiz' ? "Quiz" : "Article",
      "url": "https://music-personality-test.vercel.app",
      "name": "Music Personality Test",
      "description": "Comprehensive music personality assessment based on the MUSIC model",
      "publisher": {
        "@type": "Organization",
        "name": "Music Personality Research",
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
          "educationalLevel": "General",
          "learningResourceType": "Assessment",
          "about": {
            "@type": "Thing",
            "name": "Music Psychology",
            "description": "MUSIC model personality assessment"
          },
          "hasPart": [
            {
              "@type": "Question",
              "name": "Music Preference Questions",
              "text": "Questions about musical preferences and listening habits"
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
          "headline": data.headline || "Understanding Your Music Personality",
          "author": {
            "@type": "Organization",
            "name": "Music Personality Research"
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