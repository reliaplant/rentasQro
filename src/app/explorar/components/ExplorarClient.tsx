'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import FilterExplorador from '../../components/filterExplorador';
import { FilterProvider } from '../../context/FilterContext';
import ListaExplorador from './ListaExplorador';
import MapaZibata2 from '../../mapaZibata2/components/mapaZibata2';
import MobileSearchHeader from './MobileSearchHeader';

export default function ExplorarClient() {
  // Get height of filter component to position the map properly
  const filterRef = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState('64px'); // Default to menu height

  // Calculate top position for the sticky map after component mounts
  useEffect(() => {
    if (filterRef.current) {
      const filterHeight = filterRef.current.offsetHeight;
      // Set top offset to account for menu (64px) + filter height
      setTopOffset(`${64 + filterHeight}px`);
    }
    
    // Update on resize in case filter height changes on different screen sizes
    const handleResize = () => {
      if (filterRef.current) {
        const filterHeight = filterRef.current.offsetHeight;
        setTopOffset(`${64 + filterHeight}px`);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <FilterProvider>
      <div className="flex flex-col min-h-screen">
        {/* Mobile search header - only visible on mobile */}
        <MobileSearchHeader />
        
        {/* Filter below the main menu - hidden on mobile when MobileSearchHeader is active */}
        <div ref={filterRef} className="hidden md:block sticky w-full z-30" style={{ top: '64px' }}>
          <FilterExplorador />
        </div>
        
        {/* Content area with regular page scroll - responsive layout */}
        <div className="flex flex-col md:flex-row w-full">
          {/* Left section - properties list (full width on mobile, 60% on desktop) */}
          <div className="w-full md:w-[60%]">
            <Suspense fallback={<div>Cargando propiedades...</div>}>
              <ListaExplorador />
            </Suspense>
          </div>
          
          {/* Right section - map (hidden on mobile, 40% on desktop) */}
          <div 
            className="hidden md:block md:w-[40%]"
            style={{
              position: 'sticky',
              top: topOffset,
              height: `calc(100vh - ${topOffset})`,
              alignSelf: 'flex-start',
              overflow: 'hidden' // Prevent any overflow issues
            }}
          >
            <MapaZibata2 />
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
