import { Metadata } from 'next';
import ZibataInfo from '../propiedad/[id]/components/zibata';

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Zibatá | El mejor fraccionamiento para vivir en Querétaro | PIZO MX',
  description: 'Descubre por qué Zibatá se ha convertido en el mejor lugar para vivir en Querétaro. Amplia oferta de casas y departamentos en exclusivos condominios residenciales.',
  keywords: 'Zibatá, fraccionamiento Querétaro, casas en Zibatá, departamentos en Zibatá, bienes raíces Querétaro, vivir en Zibatá',
  openGraph: {
    title: 'Zibatá | El mejor fraccionamiento para vivir en Querétaro',
    description: 'Descubre por qué Zibatá se ha convertido en el mejor lugar para vivir en Querétaro. Amplia oferta de casas y departamentos en exclusivos condominios residenciales.',
    url: 'https://www.pizo.mx/zibata',
    siteName: 'PIZO MX',
    images: [
      {
        url: 'https://www.pizo.mx/assets/zibata/zibata.jpg',
        width: 1200,
        height: 630,
        alt: 'Vista aérea de Zibatá',
      }
    ],
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zibatá | El mejor fraccionamiento para vivir en Querétaro',
    description: 'Descubre por qué Zibatá se ha convertido en el mejor lugar para vivir en Querétaro. Amplia oferta de casas y departamentos en exclusivos condominios residenciales.',
    images: ['https://www.pizo.mx/assets/zibata/zibata.jpg'],
  },
  alternates: {
    canonical: 'https://www.pizo.mx/zibata',
  }
};

export default function ZibataPage() {
  return (
    <main>
      <ZibataInfo />
    </main>
  );
}
