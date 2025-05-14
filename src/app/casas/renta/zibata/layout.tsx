import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casas en Renta en Zibatá | Propiedades exclusivas disponibles',
  description: 'Renta casas y departamentos en Zibatá, la zona residencial más exclusiva de Querétaro. Propiedades seguras con amenidades de primer nivel.',
  keywords: 'casas en renta zibata, departamentos zibata, rentar en zibata, propiedades zibata, renta querétaro exclusivo',
};

export default function ZibataRentaLayout({
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
            'name': 'Casas en Renta en Zibatá',
            'description': 'Renta casas y departamentos en Zibatá, la zona residencial más exclusiva de Querétaro. Propiedades seguras con amenidades de primer nivel.',
            'url': 'https://pizo.mx/casas/renta/zibata',
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
