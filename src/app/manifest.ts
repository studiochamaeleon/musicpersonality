import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Music Personality Test',
    short_name: 'MusicPersonality',
    description: 'Discover your musical identity through comprehensive personality assessment',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0f23',
    theme_color: '#6366f1',
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
    lang: 'en',
  }
}