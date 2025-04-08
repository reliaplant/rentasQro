// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/zona/',
          '/condominio/',
          '/blog/',
          '/guia/',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/asesor/',
          '/login/',
          '/perfil/',
          '/dashboard/',
          '/favoritos/',
          '/auth/',
          '/buscar',          // Block search page
          '/busqueda',        // Block search results
          '/*?*',             // Block all URLs with query parameters
          '/*page=*',         // Block pagination
          '/*filter=*',       // Block filter parameters
          '/*sort=*',         // Block sorting parameters
          '/*q=*',            // Block search queries
          '/*categoria=*',    // Block category filters
          '/*precio=*',       // Block price filters
        ],
        crawlDelay: 10,
      },
    ],
    host: 'https://pizo.mx',
    sitemap: 'https://pizo.mx/sitemap.xml',
  };
}