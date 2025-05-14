import { Metadata } from 'next';
import FilterExplorador from '@/app/components/filterExplorador';
import Explorador from '@/app/components/explorador';
import QueretaroRentaFiltersInitializer from './QueretaroRentaFiltersInitializer';

// Metadata for SEO
export const metadata: Metadata = {
    title: 'Casas en Renta en Querétaro | Las mejores opciones residenciales',
    description: 'Encuentra casas y departamentos en renta en Querétaro. Gran selección de propiedades residenciales en zonas exclusivas con todos los servicios.',
    keywords: 'casas en renta queretaro, departamentos renta, rentar casa queretaro, alquiler queretaro, inmuebles en renta',
    openGraph: {
        title: 'Casas en Renta en Querétaro | Propiedades Residenciales',
        description: 'Descubre las mejores opciones de renta en Querétaro. Casas y departamentos en las zonas más seguras y bien conectadas.',
        images: ['/assets/images/queretaro-hero.jpg'],
        type: 'website',
        locale: 'es_MX',
    },
};

export default function QueretaroRentaPage() {
    return (
        <main className="min-h-screen">
            {/* SEO-friendly header */}
            <div className="bg-gradient-to-r from-violet-800 to-violet-700 py-6 px-20">
                <div className="w-full">
                    <h1 className="!text-xl md:text-4xl font-semibold mb-2 !text-white">
                        Casas en Renta en Querétaro
                    </h1>
                    <p className="!text-sm  !text-white/90">
                        Encuentra la casa o departamento ideal para vivir en Querétaro. Opciones de renta en zonas exclusivas, seguras y bien conectadas con todos los servicios a tu alcance.
                    </p>
                </div>
            </div>

            {/* Client component to initialize filters */}
            <QueretaroRentaFiltersInitializer />

            {/* Filter and explorer components */}
            <FilterExplorador />
            <Explorador />
        </main>
    );
}
