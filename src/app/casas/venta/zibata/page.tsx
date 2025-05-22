import { Metadata } from 'next';
import FilterExplorador from '@/app/components/filterExplorador';
import Explorador from '@/app/components/explorador';
import ZibataFiltersInitializer from './ZibataFiltersInitializer';
import { FilterProvider } from '@/app/context/FilterContext';

// This metadata export works in Server Components
export const metadata: Metadata = {
  title: 'Casas en Venta en Zibatá | Las mejores propiedades exclusivas',
  description: 'Descubre casas en venta en Zibatá, Querétaro. Propiedades exclusivas en una de las zonas más prestigiosas con todos los servicios y amenidades de primer nivel.',
  keywords: 'casas en venta zibata, zibata queretaro, casas exclusivas zibata, propiedades zibata, comprar casa zibata',
  openGraph: {
    title: 'Casas en Venta en Zibatá | Propiedades Exclusivas',
    description: 'Encuentra las mejores casas en venta en la zona residencial más exclusiva de Querétaro. ¡Tu hogar ideal te espera en Zibatá!',
    images: ['/assets/images/zibata-hero.jpg'],
    type: 'website',
    locale: 'es_MX',
  },
};

export default function ZibataVentaPage() {
  return (
    <main className="min-h-screen">
      {/* SEO-friendly header */}
      <div className="bg-gradient-to-r from-violet-800 to-violet-700 py-6 px-20">
        <div className="w-full">
          <h1 className="!text-xl  font-semibold mb-2 !text-white">
            Casas en Venta en Zibatá
          </h1>
          <p className="!text-sm !text-white/90">
            Descubre tu hogar soñado en Zibatá, la comunidad planeada más prestigiosa de Querétaro. Arquitectura de vanguardia, amenidades de clase mundial y un entorno natural excepcional.
          </p>
        </div>
      </div>



      {/* Filter and explorer components */}
      <FilterProvider>
        {/* Client component to initialize filters */}
        <ZibataFiltersInitializer />
        <FilterExplorador />
        <Explorador />
      </FilterProvider>

    </main>
  );
}
