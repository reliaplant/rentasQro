// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/asesor/',
          '/propiedad/',
          '/busqueda',
        ],
      },
    ],
    sitemap: 'https://pizo.mx/sitemap.xml',  // Update this to match your domain in sitemap.ts
  };
}