"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HomeBanner from './components/HomeBanner';
import { FilterProvider } from './context/FilterContext';
import FeaturedProperties from './components/FeaturedProperties';
import { getProperties } from './shared/firebase';
import { PropertyData } from './shared/interfaces';

export default function Home() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [saleProperties, setSaleProperties] = useState<PropertyData[]>([]);
  const [rentalProperties, setRentalProperties] = useState<PropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to detect when the page is completely loaded
  useEffect(() => {
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    } else {
      const handleLoad = () => setIsLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Fetch properties for both sections at once
  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        setIsLoading(true);
        
        // Get all properties in a single request
        const allProperties = await getProperties();
        console.log(`Home: Fetched ${allProperties.length} total properties`);
        
        // Filter for published properties only
        const publishedProperties = allProperties.filter(p => p.status === 'publicada');
        
        // Filter for sale properties (not preventa)
        const forSaleProps = publishedProperties
          .filter(p => 
            (p.transactionType === 'venta' || p.transactionType === 'ventaRenta') && 
            p.preventa !== true
          )
          .sort((a, b) => {
            const dateA = a.publicationDate?.toDate?.() || new Date();
            const dateB = b.publicationDate?.toDate?.() || new Date();
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 4);
        
        // Filter for rental properties
        const forRentProps = publishedProperties
          .filter(p => 
            (p.transactionType === 'renta' || p.transactionType === 'ventaRenta')
          )
          .sort((a, b) => {
            const dateA = a.publicationDate?.toDate?.() || new Date();
            const dateB = b.publicationDate?.toDate?.() || new Date();
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 4);
        
        console.log(`Home: Found ${forSaleProps.length} sale properties and ${forRentProps.length} rental properties`);
        
        setSaleProperties(forSaleProps);
        setRentalProperties(forRentProps);
      } catch (error) {
        console.error('Error fetching properties for homepage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllProperties();
  }, []);

  return (
      <main className="min-h-screen bg-gray-50">
        {/* Banner with higher priority */}
        <HomeBanner />
        <FilterProvider>
          {/* Featured properties sections */}
          <div className="mx-auto px-4 sm:px-[5vw] py-8 space-y-6">
            {/* Properties for sale section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Inmuebles en venta</h2>
              <FeaturedProperties 
                transactionType="compra"
                limit={4}
                preventa={false}
                properties={saleProperties}
                isLoading={isLoading}
              />
              <div className="flex justify-center mt-8">
                <Link 
                  href="/explorar?t=compra&preventa=false" 
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-md text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all"
                >
                  Ver más propiedades en venta
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-1.5 w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </section>
            
            {/* Properties for rent section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Inmuebles en renta</h2>
              <FeaturedProperties 
                transactionType="renta"
                limit={4}
                preventa={false}
                properties={rentalProperties}
                isLoading={isLoading}
              />
              <div className="flex justify-center mt-8">
                <Link 
                  href="/explorar?t=renta&preventa=false" 
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-md text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all"
                >
                  Ver más propiedades en renta
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="ml-1.5 w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </section>
          </div>
          
          {/* Call to action section - styled to match HomeBanner */}
          <section className="w-full">
            <div className="">
              <div className="relative overflow-hidden bg-gray-900">
                {/* Background decorative elements - similar to HomeBanner */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-[400px] h-[200px] bg-purple-600/60 rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite] -top-20 -left-20"></div>
                  <div className="absolute w-[300px] h-[200px] bg-cyan-400/70 rounded-full blur-3xl animate-[wave_10s_ease-in-out_infinite] top-40 left-1/2"></div>
                  <div className="absolute w-[200px] h-[300px] bg-yellow-400/60 rounded-full blur-3xl animate-[float_12s_ease-in-out_infinite] bottom-0 -right-20"></div>
                </div>
                
                <div className="relative px-6 py-16 sm:px-12 sm:py-20 flex flex-col items-center z-10">
                  <h2 className="text-3xl sm:text-4xl font-semibold leading-tight !text-white">
                    Encuentra el inmueble perfecto para ti
                  </h2>
                  <p className="mt-6 text-lg !text-white/90 text-center max-w-2xl">
                    Explora nuestra amplia variedad de propiedades en Querétaro y descubre tu próximo hogar o inversión.
                  </p>
                  <Link 
                    href="/explorar" 
                    className="mt-8 inline-flex items-center px-8 py-4 text-base font-medium rounded-full bg-white text-black hover:bg-gray-100 shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    Ver todas las propiedades
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="ml-2 w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </FilterProvider>
      </main>
  );
}