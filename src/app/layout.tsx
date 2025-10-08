import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "@/components/StructuredData";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
  keywords: ["music personality test", "MUSIC model", "music psychology", "genre recommendations", "personality assessment", "musical preferences", "music discovery"],
  authors: [{ name: "Music Personality Research" }],
  creator: "Music Personality Test",
  publisher: "Music Personality Test",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://music-personality-test.vercel.app'),
  openGraph: {
    title: "Music Personality Test - Discover Your Musical Identity",
    description: "Take our comprehensive music personality assessment and discover your unique musical preferences with personalized recommendations.",
    url: 'https://music-personality-test.vercel.app',
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
    google: 'your-google-verification-code',
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
