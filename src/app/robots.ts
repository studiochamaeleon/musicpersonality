import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/siteUrl'

export const dynamic = 'force-static'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
