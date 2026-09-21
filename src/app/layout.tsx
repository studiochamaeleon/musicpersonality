import type { Metadata } from "next";
import "./globals.css";
import StructuredData from "@/components/StructuredData";
import { LanguageProvider } from "@/contexts/LanguageContext";
import DynamicLang from "@/components/DynamicLang";
import DynamicMetadata from "@/components/DynamicMetadata";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "음악 성격 테스트 | 나와 닮은 장르 찾기",
  description: "음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요. MUSIC 모델에서 영감을 받은 가벼운 테스트입니다.",
  keywords: [
    "music personality test", "music taste quiz", "MUSIC model", "genre discovery", "music recommendations",
    "음악 성격 테스트", "음악 취향 테스트", "음악 성향", "장르 추천", "친구 음악 궁합"
  ],
  authors: [{ name: "CHAMELEONS" }],
  creator: "CHAMELEONS",
  publisher: "CHAMELEONS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "음악 성격 테스트 | 나와 닮은 장르 찾기",
    description: "음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요.",
    url: SITE_URL,
    siteName: 'Music Personality Test',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '음악 성격 테스트 — 나와 닮은 장르 찾기',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "음악 성격 테스트 | 나와 닮은 장르 찾기",
    description: "음악 취향에 답하고 나와 닮은 장르와 앨범을 발견해보세요.",
    images: ['/og-image.png'],
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
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon-512x512.svg', sizes: 'any', type: 'image/svg+xml' },
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
    <html lang="ko">
      <head>
        <StructuredData />
        {process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== 'false' && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5112443746505917"
            crossOrigin="anonymous"
          />
        )}
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
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <DynamicLang />
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
