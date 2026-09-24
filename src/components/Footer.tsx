'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { language } = useLanguage();
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#050507] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold tracking-[-0.02em]">MUTI</p>
            <p className="mt-1 text-xs text-white/65">Music Taste Identity · {language === 'ko' ? '가벼운 음악 취향 테스트' : language === 'ja' ? '気軽な音楽の好みテスト' : 'A lighthearted music taste test'}</p>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="text-xs text-white/65 transition-colors hover:text-white">
              {language === 'ko' ? '개인정보 처리방침' : language === 'ja' ? 'プライバシー' : 'Privacy'}
            </Link>
            <Link href="/terms" className="text-xs text-white/65 transition-colors hover:text-white">
              {language === 'ko' ? '이용약관' : language === 'ja' ? '利用規約' : 'Terms'}
            </Link>
          </div>
        </div>
        <p className="mt-6 border-t border-white/10 pt-5 text-[11px] text-white/30">
          © {new Date().getFullYear()} MUTI · CHAMELEONS
        </p>
      </div>
    </footer>
  );
}
