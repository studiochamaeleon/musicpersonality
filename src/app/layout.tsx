import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DynamicLang from "@/components/DynamicLang";
import DynamicStructuredData from "@/components/DynamicStructuredData";
import DynamicMetadata from "@/components/DynamicMetadata";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Music Personality Test - Discover Your Musical Identity",
  description: "Take our comprehensive music personality assessment based on the MUSIC model. Discover your unique musical preferences, get personalized genre recommendations, and explore new artists tailored to your personality.",
  keywords: [
    // === 기존 핵심 키워드 유지 ===
    "music personality test", "MUSIC model", "music psychology", "genre recommendations", "personality assessment", "musical preferences", "music discovery",
    
    // === 고트래픽 일반 키워드 ===
    "free personality test", "personality quiz", "psychology test online", "character test", "behavioral assessment", "temperament test", "fun personality test", "accurate personality test", "personality analysis", "psychological assessment", "online quiz", "personality profile",
    
    // === 음악 특화 키워드 ===  
    "music taste personality", "musical identity test", "genre personality quiz", "music preference analysis", "spotify personality", "musical behavior test", "music psychology quiz", "audio personality", "sound preference test",
    
    // === 엔터테인먼트 키워드 ===
    "viral personality test", "shareable quiz", "trending personality test", "social media quiz", "interactive personality quiz",
    
    // === 기존 한국어 키워드 유지 ===
    "음악 성격 테스트", "음악 취향 테스트", "성격 유형 검사", "음악 MBTI", "음악 심리 테스트", "음악 성향 분석", "음악 선호도 테스트", "성격 테스트", "심리 테스트", "음악 추천", "장르 추천",
    
    // === 고트래픽 한국어 키워드 ===
    "무료 성격 테스트", "재미있는 테스트", "온라인 심리테스트", "캐릭터 테스트", "취향 분석", "심리 분석", "성향 테스트", "무료 심리테스트", "정확한 성격테스트", "빠른 성격테스트", "심리게임", "성격분석",
    
    // === 음악 특화 한국어 키워드 ===
    "음악 취향 분석", "장르별 성격", "음악적 정체성", "스포티파이 성격", "음악 행동 분석", "사운드 선호도", "음악 캐릭터",
    
    // === 바이럴/소셜 한국어 키워드 ===
    "바이럴 테스트", "공유하기 좋은 테스트", "인스타 테스트", "SNS 테스트", "화제의 테스트", "인기 성격테스트"
  ],
  authors: [{ name: "Music Personality Research" }],
  creator: "Music Personality Test",
  publisher: "Music Personality Test",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://musicpersonalitytest.pages.dev'),
  openGraph: {
    title: "Music Personality Test - Discover Your Musical Identity",
    description: "Take our comprehensive music personality assessment and discover your unique musical preferences with personalized recommendations.",
    url: 'https://musicpersonalitytest.pages.dev',
    siteName: 'Music Personality Test',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Music Personality Test - Discover Your Musical Identity',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Music Personality Test - Discover Your Musical Identity",
    description: "Take our comprehensive music personality assessment and discover your unique musical preferences with personalized recommendations.",
    images: ['/og-image.png'],
    creator: '@musicpersonality',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '897h18-AYZCjwMGmgsBpLGqcLj306BDOaleFgmFbYOg',
    yandex: 'your-yandex-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon-32x32.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData type="website" />
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5112443746505917"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <LanguageProvider>
          <DynamicLang />
          <DynamicStructuredData />
          <DynamicMetadata />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
