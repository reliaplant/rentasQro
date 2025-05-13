import { MetadataRoute } from 'next'
import { getZones, getCondominiums, getPublishedBlogPosts } from '@/app/shared/firebase'

type SitemapEntry = {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Add this helper function at the top
function sanitizeUrlSegment(segment: string): string {
  return segment
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-') || '';
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pizo.mx'; // Ensure this URL is correct

  try {
    const zones = await getZones();
    const condos = await getCondominiums();
    const blogPosts = await getPublishedBlogPosts();

    const staticRoutes: SitemapEntry[] = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/contacto`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/zibata`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }
    ];

    const zoneRoutes: SitemapEntry[] = zones
      .filter(zone => zone?.name)
      .map((zone) => ({
        url: `${baseUrl}/${sanitizeUrlSegment(zone.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    const condoRoutes: SitemapEntry[] = condos
      .filter(condo => condo?.name && condo?.zoneName)
      .map((condo) => ({
        url: `${baseUrl}/qro/${sanitizeUrlSegment(condo.zoneName)}/${sanitizeUrlSegment(condo.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    // Add blog routes
    const blogRoutes: SitemapEntry[] = blogPosts
      .filter(post => post.published && (post.slug || post.id))
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug || post.id}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    // Make sure we're returning a correctly formatted sitemap
    return [...staticRoutes, ...zoneRoutes, ...condoRoutes, ...blogRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}