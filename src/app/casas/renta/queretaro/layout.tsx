import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Casas en Renta en Querétaro | Las mejores opciones residenciales',
  description: 'Encuentra casas y departamentos en renta en Querétaro. Gran selección de propiedades residenciales en zonas exclusivas con todos los servicios.',
  keywords: 'casas en renta queretaro, departamentos renta, rentar casa queretaro, alquiler queretaro, inmuebles en renta',
};

export default function QueretaroRentaLayout({
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
            'name': 'Casas en Renta en Querétaro',
            'description': 'Encuentra casas y departamentos en renta en Querétaro. Gran selección de propiedades residenciales en zonas exclusivas con todos los servicios.',
            'url': 'https://pizo.mx/casas/renta/queretaro',
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
