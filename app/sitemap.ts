import type { MetadataRoute } from 'next';
import { publicRoutes, SITE_URL } from '@/configs/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return publicRoutes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/HomeScreen' ? 'daily' : 'weekly',
    priority: path === '' || path === '/HomeScreen' ? 1 : path.includes('FAQ') || path.includes('Terms') || path.includes('Privacy') ? 0.7 : 0.8,
  }));
}
