import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: '개인정보 보호정책 | MUTI',
  description: 'MUTI 음악 취향 테스트의 로컬 저장소, 공유 링크 및 제3자 서비스 이용에 관한 개인정보 처리방침입니다.',
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: '개인정보 보호정책 | MUTI',
    description: 'MUTI 음악 취향 테스트의 개인정보 처리방침입니다.',
    url: `${SITE_URL}/privacy`,
    siteName: 'MUTI',
    type: 'website',
  },
};

export default function PrivacyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
