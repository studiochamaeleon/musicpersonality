import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MUTI — Music Taste Identity',
    short_name: 'MUTI',
    description: 'A lighthearted music taste test with genre and album discovery',
    start_url: '/',
    display: 'standalone',
    background_color: '#07080a',
    theme_color: '#07080a',
    icons: [
      {
        src: '/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
    categories: ['entertainment', 'music', 'personalization'],
    orientation: 'portrait',
    scope: '/',
    lang: 'ko',
  }
}
