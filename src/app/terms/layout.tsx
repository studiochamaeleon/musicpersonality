import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: '이용약관 | MUTI',
  description: 'MUTI 음악 취향 테스트의 서비스 이용 조건과 음악 성격 해석에 관한 안내입니다.',
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: '이용약관 | MUTI',
    description: 'MUTI 음악 취향 테스트의 서비스 이용 조건입니다.',
    url: `${SITE_URL}/terms`,
    siteName: 'MUTI',
    type: 'website',
  },
};

export default function TermsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
