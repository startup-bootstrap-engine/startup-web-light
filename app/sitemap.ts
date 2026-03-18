import { MetadataRoute } from 'next';
import { getCategories } from '../src/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const categories = getCategories();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const categoryUrls = categories.map(category => ({
    url: `${baseUrl}/portfolio/${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...categoryUrls,
  ];
}
