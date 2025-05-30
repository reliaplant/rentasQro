'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import FilterExplorador from '../../components/filterExplorador';
import { FilterProvider, useFilters } from '../../context/FilterContext';
import ListaExplorador from './ListaExplorador';
import MapaZibata2 from '../../mapaZibata2/components/mapaZibata2';
import FloatingPropertyCards from './FloatingPropertyCards';
import { FaSort, FaFilter, FaMap, FaTimes } from 'react-icons/fa';
import { VscSettings } from "react-icons/vsc";
import { BiSortAlt2 } from "react-icons/bi";
import { LuMap } from "react-icons/lu";
import MobileSearchHeader from './MobileSearchHeader'; // Changed to MobileSearchHeader

// Create a wrapper component to use the filter context hooks
function ExplorarClientInner() {
  const filterRef = useRef<HTMLDivElement>(null);
  const [topOffset, setTopOffset] = useState('64px'); // Default to menu height
  
  // Define a type for valid sort options
  type SortOptionType = 'relevante' | 'reciente' | 'precio-alto' | 'precio-bajo';
  
  // States for mobile interactions
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [isMapTransitioning, setIsMapTransitioning] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSorting, setShowMobileSorting] = useState(false);
  const [currentSortOption, setCurrentSortOption] = useState<SortOptionType>('relevante');
  const [triggerMapResize, setTriggerMapResize] = useState(0);
  // Add state to track mobile view
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Add state for selected condo properties
  const [selectedCondoProps, setSelectedCondoProps] = useState<{
    condoId: string;
    condoName: string;
    properties: any[];
  } | null>(null);
  
  // Check if we're on mobile view on mount and on window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };
    
    // Initial check
    checkIsMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // Handle map toggle more smoothly with simplified logic
  const handleMapToggle = () => {
    // Simple toggle without extra state management
    setShowMobileMap(prevState => {
      const newState = !prevState;
      
      // Clear properties and trigger resize in one place
      if (!newState) {
        setSelectedCondoProps(null);
      } else {
        setTimeout(() => setTriggerMapResize(prev => prev + 1), 100);
      }
      
      return newState;
    });
  };
  
  // Add a mapping of sort options to user-friendly labels
  const sortOptions: Record<SortOptionType, string> = {
    'relevante': 'Más relevantes',
    'reciente': 'Más recientes',
    'precio-alto': 'Mayor precio',
    'precio-bajo': 'Menor precio'
  };
  
  // Get filters to count applied filters
  const { filters } = useFilters();
  
  // Count applied filters (excluding obvious ones like transactionType)
  const countAppliedFilters = () => {
    let count = 0;
    
    // Count each filter that's applied
    if (filters.selectedZone) count++;
    if (filters.propertyType) count++;
    if (filters.preventaFilterActive) count++;
    if (filters.bedrooms !== null) count++;
    if (filters.bathrooms !== null) count++;
    if (filters.parkingSpots !== null) count++;
    if (filters.isFurnished) count++;
    if (filters.petsAllowed) count++;
    if (filters.priceRange[0] > 0) count++;
    if (filters.priceRange[1] < 1000000000) count++; // Using a constant like MAX_PRICE would be better
    
    return count;
  };
  
  const appliedFiltersCount = countAppliedFilters();

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

  // Handle condo click on mobile map
  const handleCondoClick = (condoId: string, condoName: string, properties: any[]) => {
    // Only show properties when in mobile view
    if (isMobileView) {
      setSelectedCondoProps({
        condoId,
        condoName,
        properties
      });
    }
  };
  
  // Clear selected condo properties
  const clearSelectedCondo = () => {
    setSelectedCondoProps(null);
  };

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Remove MobileSearchHeader */}
      
      {/* Filter below the main menu - hidden on mobile when MobileSearchHeader is active */}
      <div ref={filterRef} className="hidden md:block sticky w-full z-30" style={{ top: '64px' }}>
        <FilterExplorador />
      </div>
      
      {/* Content area with regular page scroll - responsive layout */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left section - properties list (hide when map is shown without animation) */}
        <div className={`w-full md:w-[60%] ${showMobileMap ? 'hidden' : 'block'}`}>
          <Suspense fallback={<div>Cargando propiedades...</div>}>
            <ListaExplorador />
          </Suspense>
        </div>
        
        {/* Right section - map (conditionally shown on mobile, 40% on desktop) */}
        <div 
          className={`
            ${showMobileMap ? 'fixed inset-0 z-[100]' : 'hidden'} 
            md:relative md:block md:w-[40%] md:z-auto
          `}
        >
          {/* Single map container with immediate full size */}
          <div 
            className={`h-full w-full`} 
            style={{
              position: showMobileMap ? 'absolute' : 'sticky',
              top: showMobileMap ? 0 : topOffset,
              height: showMobileMap ? '100vh' : `calc(100vh - ${topOffset})`,
              width: '100%',
              inset: showMobileMap ? 0 : 'auto',
            }}
          >
            <MapaZibata2 
              allowCondoFilter={!showMobileMap} 
              resizeTrigger={triggerMapResize}
              immediateResize={true}
              onCondoClick={handleCondoClick}
            />
          </div>
          
          {/* Close map button - only on mobile */}
          {showMobileMap && (
            <button 
              onClick={() => setShowMobileMap(false)}
              className="md:hidden fixed top-4 right-4 bg-white shadow-lg rounded-full p-3 z-[101]"
            >
              <FaTimes className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <MobileSearchHeader
          isOpen={showMobileFilters}
          onClose={() => setShowMobileFilters(false)}
        />
      )}
      
      {/* Add Mobile Sorting Modal */}
      {showMobileSorting && (
        <div className="fixed inset-0 bg-white z-[9999] md:hidden">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ordenar por</h2>
              <button 
                onClick={() => setShowMobileSorting(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
                aria-label="Cerrar"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Sorting options */}
            <div className="flex-1 p-4">
              <div className="space-y-2">
                {Object.entries(sortOptions).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => {
                      setCurrentSortOption(id as SortOptionType);
                      // Dispatch an event to update sort in the ListaExplorador component
                      window.dispatchEvent(new CustomEvent('updateSort', { 
                        detail: { sortOption: id } 
                      }));
                      setShowMobileSorting(false);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-lg ${
                      currentSortOption === id
                        ? 'bg-violet-50 text-violet-700 font-medium'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{label}</span>
                    {currentSortOption === id && (
                      <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating property cards when a condo is selected (mobile only) */}
      {showMobileMap && selectedCondoProps && selectedCondoProps.properties.length > 0 && (
        <FloatingPropertyCards
          properties={selectedCondoProps.properties}
          condoName={selectedCondoProps.condoName}
          onClose={clearSelectedCondo}
          transactionType={filters.transactionType === 'renta' ? 'renta' : 'compra'}
        />
      )}
      
      {/* Floating pill navigation for mobile */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-white shadow-lg rounded-full z-[110] border border-gray-100">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="flex items-center px-3 py-2 text-xs font-medium text-gray-700"
        >
          <VscSettings className="w-3.5 h-3.5 mr-1" />
          Filtrar
          {appliedFiltersCount > 0 && (
            <span className="ml-1 bg-black text-white text-xs min-w-[16px] h-[16px] inline-flex items-center justify-center rounded-full">
              {appliedFiltersCount}
            </span>
          )}
        </button>
        
        <div className="h-[16px] w-px bg-gray-200"></div>
        
        <button
          onClick={() => setShowMobileSorting(true)}
          className={`flex items-center px-3 py-2 text-xs font-medium whitespace-nowrap ${
            currentSortOption !== 'relevante' ? 'text-violet-700' : 'text-gray-700'
          }`}
        >
          <BiSortAlt2 className="w-3.5 h-3.5 mr-1" />
          {currentSortOption === 'relevante' ? 'Ordenar' : sortOptions[currentSortOption]}
        </button>
        
        <div className="h-[16px] w-px bg-gray-200"></div>
        
        <button
          onClick={handleMapToggle}
          className={`flex items-center px-3 py-2 text-xs font-medium ${showMobileMap ? 'bg-violet-50 text-violet-700' : 'text-gray-700'}`}
          disabled={isMapTransitioning}
        >
          <LuMap className="w-3.5 h-3.5 mr-1" />
          {showMobileMap ? 'Lista' : 'Mapa'}
        </button>
      </div>
    </div>
  );
}

// Main component that provides the filter context
export default function ExplorarClient() {
  return (
    <FilterProvider>
      <ExplorarClientInner />
    </FilterProvider>
  );
}
