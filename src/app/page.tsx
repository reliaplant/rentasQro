"use client";

import { useState, useEffect, Suspense, lazy } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Importar HomeBanner con prioridad alta
import HomeBanner from './components/HomeBanner';
import { FilterProvider } from './context/FilterContext';

// Esqueletos de carga
const FilterSkeleton = () => (
  <div className="w-full h-16 bg-gray-100 animate-pulse rounded-md"></div>
);

const ExploradorSkeleton = () => (
  <div className="mx-auto px-3 sm:px-[5vw] py-8 sm:py-12">
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
      {[...Array(10)].map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Componente esqueleto para las tarjetas de propiedades
const PropertyCardSkeleton = () => (
  <div className="group block">
    <div className="relative rounded-xl overflow-hidden">
      <div className="aspect-[16/12] bg-gray-200 animate-pulse"></div>
      <div className="pt-2 sm:pt-3 space-y-2 sm:space-y-3">
        <div className="w-3/4 h-4 sm:h-5 bg-gray-200 animate-pulse rounded"></div>
        <div className="w-1/2 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
        <div className="flex gap-1 sm:gap-2 items-center">
          <div className="w-8 sm:w-10 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
          <div className="w-8 sm:w-10 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
          <div className="w-1 h-1 rounded-full bg-gray-200"></div>
          <div className="w-8 sm:w-10 h-3 sm:h-4 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="w-1/3 h-4 sm:h-5 bg-gray-200 animate-pulse rounded mt-1 sm:mt-2"></div>
      </div>
    </div>
  </div>
);

// Cargar componentes con dynamic import para carga diferida
const FilterExplorador = dynamic(
  () => import('./components/filterExplorador'),
  {
    loading: () => <FilterSkeleton />,
    ssr: false
  }
);

const Explorador = dynamic(
  () => import('./components/explorador'),
  {
    loading: () => <ExploradorSkeleton />,
    ssr: false
  }
);

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  // Efecto para detectar cuando la página está completamente cargada
  useEffect(() => {
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    } else {
      const handleLoad = () => setIsLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return (
      <main className="min-h-screen bg-gray-50">
        {/* Banner con mayor prioridad usando Suspense para mostrar fallback mientras carga */}
        <HomeBanner />
        <FilterProvider>
          {/* Filtros con carga diferida */}
          <FilterExplorador />
          {/* Explorador con carga diferida */}
          <Explorador />
        </FilterProvider>
      </main>

  );
}