import { MetadataRoute } from 'next';
import { getZoneByName, getCondosByZone, getAllBlogPosts } from '@/app/shared/firebase';

// Define valid changeFrequency values to fix TypeScript error
type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

// Interface for sitemap entries
interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pizo.mx'; // Replace with your actual domain
  
  // Base routes
  const routes: SitemapEntry[] = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/qro`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
        {
      url: `${baseUrl}/casas/renta/queretaro`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
            {
      url: `${baseUrl}/casas/venta/queretaro`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
       {
      url: `${baseUrl}/casas/renta/zibata`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
           {
      url: `${baseUrl}/casas/venta/zibata`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },

  ];
  
  // Dynamic condo pages in Zibata
  try {
    const zone = await getZoneByName('zibata');
    if (zone && zone.id) {
      const condos = await getCondosByZone(zone.id);
      
      const condoRoutes: SitemapEntry[] = condos.map(condo => ({
        url: `${baseUrl}/qro/zibata/${condo.name.toLowerCase().replace(/\s+/g, '-')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
      
      routes.push(...condoRoutes);
    }
  } catch (error) {
    console.error('Error generating sitemap entries for condos:', error);
  }
  
  // Blog posts
  try {
    const blogPosts = await getAllBlogPosts();
    const publishedPosts = blogPosts.filter(post => post.published);
    
    const blogRoutes: SitemapEntry[] = publishedPosts.map(post => {
      // Use slug if available, otherwise use ID
      const urlSegment = post.slug || post.id;
      return {
        url: `${baseUrl}/blog/${urlSegment}`,
        lastModified: new Date(post.updatedAt || post.publishDate),
        changeFrequency: 'monthly',
        priority: 0.6,
      };
    });
    
    routes.push(...blogRoutes);
  } catch (error) {
    console.error('Error generating sitemap entries for blog posts:', error);
  }
  
  return routes;
}