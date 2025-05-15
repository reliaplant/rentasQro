'use client';

import React, { useEffect, useRef, useState } from 'react';
import FilterExplorador from '../components/filterExplorador';
import { FilterProvider } from '../context/FilterContext';
import ListaExplorador from './components/ListaExplorador';

export default function Explorar2() {
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
        {/* Filter below the main menu (which is already rendered in the parent layout) */}
        <div ref={filterRef} className="w-full">
          <FilterExplorador />
        </div>
        
        {/* Content area with regular page scroll */}
        <div className="flex w-full">
          {/* Left section - properties list (60%) */}
          <div className="w-[60%]">
            <ListaExplorador />
          </div>
          
          {/* Right section - map (40%) - sticky */}
          <div 
            className="w-[40%] bg-amber-50 flex items-center justify-center"
            style={{
              position: 'sticky',
              top: topOffset,
              height: `calc(100vh - ${topOffset})`,
              alignSelf: 'flex-start'
            }}
          >
            <span className="text-2xl font-semibold text-amber-800">Mapa</span>
          </div>
        </div>
      </div>
    </FilterProvider>
  );
}
