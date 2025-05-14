import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casas en Venta en Zibatá | Las mejores propiedades exclusivas',
  description: 'Descubre casas en venta en Zibatá, Querétaro. Propiedades exclusivas en una de las zonas más prestigiosas con todos los servicios y amenidades de primer nivel.',
  keywords: 'casas en venta zibata, zibata queretaro, casas exclusivas zibata, propiedades zibata, comprar casa zibata',
};

export default function ZibataVentaLayout({
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
            'name': 'Casas en Venta en Zibatá',
            'description': 'Descubre casas en venta en Zibatá, Querétaro. Propiedades exclusivas en una de las zonas más prestigiosas con todos los servicios y amenidades de primer nivel.',
            'url': 'https://pizo.mx/casas/venta/zibata',
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
