import { Metadata } from 'next';
import FilterExplorador from '@/app/components/filterExplorador';
import Explorador from '@/app/components/explorador';
import ZibataRentaFiltersInitializer from './ZibataRentaFiltersInitializer';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Casas en Renta en Zibatá | Propiedades exclusivas disponibles',
  description: 'Renta casas y departamentos en Zibatá, la zona residencial más exclusiva de Querétaro. Propiedades seguras con amenidades de primer nivel.',
  keywords: 'casas en renta zibata, departamentos zibata, rentar en zibata, propiedades zibata, renta querétaro exclusivo',
  openGraph: {
    title: 'Casas en Renta en Zibatá | Propiedades Exclusivas',
    description: 'Encuentra las mejores propiedades en renta en la zona residencial más exclusiva de Querétaro. ¡Tu nuevo hogar te espera en Zibatá!',
    images: ['/assets/images/zibata-hero.jpg'],
    type: 'website',
    locale: 'es_MX',
  },
};

export default function ZibataRentaPage() {
  return (
    <main className="min-h-screen">
      {/* SEO-friendly header */}
            <div className="bg-gradient-to-r from-violet-800 to-violet-700 py-6 px-20">
                <div className="w-full">
                    <h1 className="!text-xl font-semibold mb-2 !text-white">
            Casas en Renta en Zibatá
          </h1>
           <p className="!text-sm  !text-white/90">
            Vive en la comunidad planeada más prestigiosa de Querétaro. Disfruta de un estilo de vida de lujo con campos de golf, áreas verdes y seguridad las 24 horas en Zibatá.
          </p>
        </div>
      </div>
      
      {/* Client component to initialize filters - explicitly for rental */}
      <ZibataRentaFiltersInitializer />
      {/* Filter and explorer components */}
      <FilterExplorador />
      <Explorador />
    </main>
  );
}
