import { Metadata } from 'next';
import FilterExplorador from '@/app/components/filterExplorador';
import Explorador from '@/app/components/explorador';
import QueretaroFiltersInitializer from './QueretaroFiltersInitializer';
import { FilterProvider } from '@/app/context/FilterContext';

// Metadata export for SEO
export const metadata: Metadata = {
  title: 'Casas en Venta en Querétaro | Las mejores propiedades residenciales',
  description: 'Encuentra tu casa ideal en venta en Querétaro. Amplia selección de propiedades residenciales en las mejores zonas con servicios de primer nivel.',
  keywords: 'casas en venta queretaro, propiedades queretaro, comprar casa queretaro, bienes raices queretaro, inmuebles queretaro',
  openGraph: {
    title: 'Casas en Venta en Querétaro | Propiedades Residenciales',
    description: 'Descubre las mejores casas en venta en Querétaro. ¡Tu nuevo hogar te espera en la ciudad con mejor calidad de vida!',
    images: ['/assets/images/queretaro-hero.jpg'],
    type: 'website',
    locale: 'es_MX',
  },
};

export default function QueretaroVentaPage() {
  return (
    <main className="min-h-screen">
      {/* SEO-friendly header */}
      <div className="bg-gradient-to-r from-violet-800 to-violet-700 py-6 px-20">
        <div className="w-full">
          <h1 className="!text-xl font-semibold mb-2 !text-white">
            Casas en Venta en Querétaro
          </h1>
          <p className="!text-sm !text-white/90">
            Descubre propiedades excepcionales en Querétaro, la ciudad con mejor calidad de vida en México.
            Encuentra tu hogar ideal entre nuestra selección de casas en las mejores zonas residenciales.
          </p>
        </div>
      </div>


      <FilterProvider>
        {/* Filter and explorer components */}
        {/* Client component to initialize filters */}
        <QueretaroFiltersInitializer />
        <FilterExplorador />
        <Explorador />
      </FilterProvider>
    </main>
  );
}
