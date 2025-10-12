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
    "music personality test", "MUSIC model", "music psychology", "genre recommendations", "personality assessment", "musical preferences", "music discovery",
    "음악 성격 테스트", "음악 취향 테스트", "성격 유형 검사", "음악 MBTI", "음악 심리 테스트", "음악 성향 분석", "음악 선호도 테스트", "성격 테스트", "심리 테스트", "음악 추천", "장르 추천"
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
        url: '/og-image.svg',
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
    images: ['/og-image.svg'],
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
    // TODO: Google Search Console에서 발급받은 실제 인증 코드로 교체하세요
    // https://search.google.com/search-console 에서 속성 추가 -> HTML 태그 방법 선택
    google: '897h18-AYZCjwMGmgsBpLGqcLj306BDOaleFgmFbYOg',
    yandex: 'your-yandex-verification-code',
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
