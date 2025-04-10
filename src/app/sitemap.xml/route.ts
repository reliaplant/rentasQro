import { NextResponse } from 'next/server';
import { getZones, getCondominiums } from '@/app/shared/firebase';

function sanitizeUrlSegment(segment: string): string {
  return segment
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-') || '';
}

export async function GET() {
  const baseUrl = 'https://pizo.mx';
  
  try {
    const zones = await getZones();
    const condos = await getCondominiums();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Home page
    xml += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
    
    // Contact page
    xml += `  <url>
    <loc>${baseUrl}/contacto</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    
    // Zone pages
    zones
      .filter(zone => zone?.name)
      .forEach(zone => {
        xml += `  <url>
    <loc>${baseUrl}/${sanitizeUrlSegment(zone.name)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>\n`;
      });
    
    // Condo pages
    condos
      .filter(condo => condo?.name && condo?.zoneName)
      .forEach(condo => {
        xml += `  <url>
    <loc>${baseUrl}/qro/${sanitizeUrlSegment(condo.zoneName)}/${sanitizeUrlSegment(condo.name)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
      });
    
    xml += '</urlset>';
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>\n`;
    xml += '</urlset>';
    
    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}
