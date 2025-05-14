import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casas en Venta en Querétaro | Las mejores propiedades residenciales',
  description: 'Encuentra tu casa ideal en venta en Querétaro. Amplia selección de propiedades residenciales en las mejores zonas con servicios de primer nivel.',
  keywords: 'casas en venta queretaro, propiedades queretaro, comprar casa queretaro, bienes raices queretaro, inmuebles queretaro',
};

export default function QueretaroVentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Add structured data for better SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            'name': 'Casas en Venta en Querétaro',
            'description': 'Encuentra tu casa ideal en venta en Querétaro. Amplia selección de propiedades residenciales en las mejores zonas con servicios de primer nivel.',
            'url': 'https://pizo.mx/casas/venta/queretaro',
            'areaServed': {
              '@type': 'City',
              'name': 'Querétaro'
            },
            'provider': {
              '@type': 'Organization',
              'name': 'Pizo',
              'url': 'https://pizo.mx'
            }
          })
        }}
      />
      {children}
    </>
  );
}
