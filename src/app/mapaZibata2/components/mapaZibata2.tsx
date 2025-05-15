'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getZoneById, getZoneCondos } from '@/app/shared/firebase';
import { resumenCondo } from '@/app/shared/interfaces';

// Initialize mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// Define interface for location data
interface Location {
  name: string;
  description?: string;
  coordinates: [number, number]; // [longitude, latitude]
  forRent: number;
  forSale: number;
  condoId: string;
  propiedadesRentaResumen?: any[];
  propiedadesVentaResumen?: any[];
  rentPriceMin?: number;
  rentPriceMax?: number;
  salePriceMin?: number;
  salePriceMax?: number;
}

type ViewMode = 'rent' | 'sale';

export default function MapaZibata2() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('sale');
  const activePopupRef = useRef<mapboxgl.Popup | null>(null);

  // Define a fixed center point for Zibatá that won't change
  const ZIBATA_CENTER: [number, number] = [-100.335007, 20.680079];

  // Helper function to parse property list
  const parsePropertyList = (propertyList: any): any[] => {
    if (typeof propertyList === 'string') {
      try {
        propertyList = JSON.parse(propertyList);
      } catch (error) {
        return [];
      }
    }
    
    if (typeof propertyList === 'object' && propertyList !== null && !Array.isArray(propertyList)) {
      return Object.values(propertyList);
    } else if (!Array.isArray(propertyList)) {
      return [];
    }
    
    return propertyList;
  };

  // Fetch condos data from Firebase
  useEffect(() => {
    const fetchCondos = async () => {
      try {
        setLoading(true);
        
        const ZIBATA_ZONE_ID = 'X5oWujYupjRKx0tF8Hlj';
        
        const zoneData = await getZoneById(ZIBATA_ZONE_ID);
        if (!zoneData) {
          throw new Error('Zone not found');
        }
        
        const zoneCondos = await getZoneCondos(ZIBATA_ZONE_ID);
        
        // Filter out condos with (0,0) coordinates or invalid coordinates
        const validCondos = zoneCondos.filter((condo: resumenCondo) => 
          condo && 
          condo.coordX !== undefined && 
          condo.coordY !== undefined && 
          !(condo.coordX === 0 && condo.coordY === 0)
        );
        
        if (validCondos.length === 0) {
          setError('No se encontraron condominios con ubicación válida');
          return;
        }
        
        // Convert to the Location format
        const mappedLocations = validCondos.map((condo: resumenCondo) => ({
          name: condo.condoName,
          description: '',
          coordinates: [condo.coordX, condo.coordY] as [number, number],
          forRent: condo.propiedadesEnRenta || 0,
          forSale: condo.propiedadesEnVenta || 0,
          condoId: condo.condoId,
          propiedadesRentaResumen: condo.propiedadesRentaResumen || [],
          propiedadesVentaResumen: condo.propiedadesVentaResumen || [],
          // Include price range data
          rentPriceMin: condo.rentPriceMin || 0,
          rentPriceMax: condo.rentPriceMax || 0,
          salePriceMin: condo.salePriceMin || 0,
          salePriceMax: condo.salePriceMax || 0
        }));
        
        setLocations(mappedLocations);
      } catch (err) {
        setError('Failed to load condominium data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCondos();
  }, []);

  // Custom price formatter based on transaction type with optional suffix
  const formatPriceCustom = (price: number, isRent: boolean, showSuffix = true) => {
    if (isRent) {
      // For rent: Display as "16.5k" format
      return showSuffix 
        ? `${(price / 1000).toFixed(1).replace(/\.0$/, '')}k` 
        : `${(price / 1000).toFixed(1).replace(/\.0$/, '')}`;
    } else {
      // For sale: Display as "3.5 MDP" format
      return showSuffix 
        ? `${(price / 1000000).toFixed(1).replace(/\.0$/, '')} MDP` 
        : `${(price / 1000000).toFixed(1).replace(/\.0$/, '')}`;
    }
  };

  // Create and display markers on the map
  const createMarkers = () => {
    if (!map.current) return;
    
    // Clear existing markers first
    if (markersRef.current.length > 0) {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    }
    
    // Filter locations based on current view mode
    const filteredLocations = locations.filter(location => 
      viewMode === 'rent' ? location.forRent > 0 : location.forSale > 0
    );
    
    // Create new markers
    filteredLocations.forEach(location => {
      // Calculate price range
      let priceRangeText = '';
      let priceMin = 0, priceMax = 0;
      
      if (viewMode === 'rent') {
        priceMin = location.rentPriceMin || 0;
        priceMax = location.rentPriceMax || 0;
      } else {
        priceMin = location.salePriceMin || 0;
        priceMax = location.salePriceMax || 0;
      }
      
      // Format price range text - only show suffix at the end
      if (priceMin > 0 && priceMax > 0) {
        if (priceMin === priceMax) {
          // If just one price, show single value
          priceRangeText = formatPriceCustom(priceMin, viewMode === 'rent');
        } else {
          // For range, only show suffix at the end
          priceRangeText = `${formatPriceCustom(priceMin, viewMode === 'rent', false)} - ${formatPriceCustom(priceMax, viewMode === 'rent')}`;
        }
      }
      
      // Get property count
      const propertyCount = viewMode === 'rent' ? location.forRent : location.forSale;
      
      // Create custom HTML element for marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      
      // Set accent color based on view mode
      const accentColor = viewMode === 'rent' ? '#EAB308' : '#8B5CF6';
      
      // Populate marker with content - white background with dark text and pin-like pointer
      el.innerHTML = `
        <div 
          class="flex flex-col items-center"
          style="width: 120px; transform: translate(-50%, -100%);"
          data-condo-id="${location.condoId}"
        >
          <div class="marker-container">
            <div 
              class="rounded-lg px-2 py-1 bg-white text-left shadow-md border border-gray-200"
            >
              ${priceRangeText ? `<div class="text-[10px] font-bold text-gray-700 leading-tight">${priceRangeText}</div>` : ''}
              <div class="flex items-center justify-between leading-tight">
                <span class="text-xs font-medium text-gray-800 truncate max-w-[80px]">${location.name}</span>
                <span class="font-bold text-sm ml-1 text-gray-900">${propertyCount}</span>
              </div>
            </div>
            <div class="marker-pointer" style="border-top-color: ${accentColor};"></div>
          </div>
        </div>
      `;
      
      // Create marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(location.coordinates)
        .addTo(map.current!);
      
      // Add click handler
      el.addEventListener('click', () => {
        if (activePopupRef.current) {
          activePopupRef.current.remove();
          activePopupRef.current = null;
        }
        
        // Show popup
        createLocationPopup(location.coordinates, {
          name: location.name,
          description: location.description || '',
          propertyCount: propertyCount,
          forRent: location.forRent,
          forSale: location.forSale,
          condoId: location.condoId,
          propiedadesRentaResumen: location.propiedadesRentaResumen,
          propiedadesVentaResumen: location.propiedadesVentaResumen,
          rentPriceMin: location.rentPriceMin,
          rentPriceMax: location.rentPriceMax,
          salePriceMin: location.salePriceMin,
          salePriceMax: location.salePriceMax
        });
      });
      
      // Store marker reference
      markersRef.current.push(marker);
    });
  };

  // Create and display a popup for a location
  const createLocationPopup = (coordinates: [number, number], properties: any) => {
    if (!map.current) return;
    
    let currentViewMode = viewMode;
    
    const rentProperties = properties.propiedadesRentaResumen || [];
    const saleProperties = properties.propiedadesVentaResumen || [];
    
    let rentPropertiesArray = parsePropertyList(rentProperties);
    let salePropertiesArray = parsePropertyList(saleProperties);
    
    // Auto-switch viewMode based on available properties
    if (currentViewMode === 'rent' && rentPropertiesArray.length === 0 && salePropertiesArray.length > 0) {
      currentViewMode = 'sale';
    } else if (currentViewMode === 'sale' && salePropertiesArray.length === 0 && rentPropertiesArray.length > 0) {
      currentViewMode = 'rent';
    }
    
    let propertyList = currentViewMode === 'rent' ? rentPropertiesArray : salePropertiesArray;
    const isRentMode = currentViewMode === 'rent';
    
    // Find min and max prices if any properties exist
    let minPrice = Number.MAX_SAFE_INTEGER;
    let maxPrice = 0;
    
    if (propertyList.length > 0) {
      propertyList.forEach((prop: any) => {
        if (prop && prop.price) {
          const price = typeof prop.price === 'number' ? prop.price : parseFloat(prop.price);
          if (!isNaN(price) && price > 0) {
            minPrice = Math.min(minPrice, price);
            maxPrice = Math.max(maxPrice, price);
          }
        }
      });
    } else {
      // If no properties, use the default prices from the condo data
      if (isRentMode) {
        minPrice = properties.rentPriceMin || 0;
        maxPrice = properties.rentPriceMax || 0;
      } else {
        minPrice = properties.salePriceMin || 0;
        maxPrice = properties.salePriceMax || 0;
      }
    }
    
    // Reset min price if no valid prices found
    if (minPrice === Number.MAX_SAFE_INTEGER) minPrice = 0;
    
    // Create sample properties if needed
    if (propertyList.length === 0) {
      const count = currentViewMode === 'rent' ? properties.forRent : properties.forSale;
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          propertyList.push({
            id: `sample-${i}`,
            price: currentViewMode === 'rent' ? 15000 + (i * 2000) : 2500000 + (i * 500000),
            bedrooms: 2 + Math.floor(i / 2),
            bathrooms: 1 + Math.floor(i / 3),
            parkingSpots: 1,
            propertyType: 'casa',
            transactionType: currentViewMode === 'rent' ? 'renta' : 'venta'
          });
        }
      }
    }
    
    // Build HTML for the properties list
    let propertiesHTML = '';
    
    // Add price range at the top of the popup
    const priceRangeHTML = (minPrice > 0 && maxPrice > 0) ? 
      `<div class="text-sm font-medium text-gray-600 mb-2">
         Rango de precios: ${formatPriceCustom(minPrice, isRentMode)} - ${formatPriceCustom(maxPrice, isRentMode)}
       </div>` : '';
    
    if (propertyList.length > 0) {
      propertiesHTML = `
        ${priceRangeHTML}
        <div class="max-h-72 overflow-y-scroll pr-2 mt-3">
          <div class="grid gap-3">
            ${propertyList.map((prop: any) => {
              if (!prop) return '';
              
              const imageUrl = prop.imageUrl || '/placeholder-property.jpg';
              const propertyType = prop.propertyType 
                ? prop.propertyType.charAt(0).toUpperCase() + prop.propertyType.slice(1)
                : 'Casa';
              const constructionArea = prop.construccionM2 ? `${prop.construccionM2} m²` : '';
              const isRent = currentViewMode === 'rent';
              
              return `
                <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm hover:bg-gray-100 transition-colors">
                  <div class="flex gap-3">
                    <div class="w-20 h-20 rounded-md overflow-hidden bg-gray-200 flex-shrink-0 p-0">
                      <a href="/propiedad/${prop.id || '#'}" target="_blank" rel="noopener noreferrer">
                        <img 
                          src="${imageUrl}" 
                          alt="Propiedad" 
                          class="w-full h-full object-cover transition-opacity duration-200 opacity-0"
                          loading="lazy"
                          style="background-size: cover; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjwvc3ZnPg==');"
                          onload="this.onload=null; this.classList.remove('opacity-0');"
                          onerror="this.src='/placeholder-property.jpg'; this.onerror=null; this.classList.remove('opacity-0');"
                        >
                      </a>
                    </div>
                    <div class="flex-grow">
                      <div class="flex justify-between items-center">
                        <div class="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>${propertyType}</span>
                        </div>
                        <span class="font-medium text-lg ml-auto">${formatPriceCustom(prop.price || 0, isRent)}</span>
                      </div>
                      <div class="flex flex-wrap gap-2 mt-1 text-gray-700">
                        ${constructionArea ? `
                        <div class="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          <span>${constructionArea}</span>
                        </div>
                        ` : ''}
                        <div class="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span>${prop.bedrooms || 0} rec</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>${prop.bathrooms || 0} baños</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else {
      propertiesHTML = `
        <div class="mt-3 text-base text-gray-500 italic p-4 bg-gray-50 rounded-lg">
          No hay propiedades ${viewMode === 'rent' ? 'en renta' : 'en venta'} disponibles para mostrar
        </div>
      `;
    }
    
    // Create popup
    activePopupRef.current = new mapboxgl.Popup({
      maxWidth: '350px',
      closeButton: true,
      closeOnClick: true,
      className: 'custom-popup'
    })
      .setLngLat(coordinates)
      .setHTML(`
        <div class="popup-content">
          <h3 class="font-bold text-xl text-indigo-800">${properties.name}</h3>
          ${propertiesHTML}
        </div>
      `)
      .addTo(map.current);
    
    activePopupRef.current.on('close', () => {
      activePopupRef.current = null;
    });
  };

  // Initialize map once locations are loaded
  useEffect(() => {
    if (map.current || !mapContainer.current || loading) return;
    if (locations.length === 0) return;

    // Initialize map
    const initMap = () => {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: ZIBATA_CENTER,
        zoom: 14.5,
      });
      
      map.current.on('load', () => {
        map.current?.setCenter(ZIBATA_CENTER);
        createMarkers();
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    };

    initMap();

    return () => {
      // Clean up markers when map unmounts
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
      }
      map.current?.remove();
    };
  }, [loading, locations]);

  // Update markers when view mode changes
  useEffect(() => {
    if (!map.current || locations.length === 0) return;
    createMarkers();
  }, [viewMode, locations]);

  // Toggle view mode between rent and sale
  const toggleViewMode = () => {
    const newMode = viewMode === 'rent' ? 'sale' : 'rent';
    
    // Close any existing popup
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }
    
    setViewMode(newMode);
  };

  if (error) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl text-red-600 mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[800px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl mb-2">Cargando mapa...</h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Custom CSS for popups and markers */}
      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .mapboxgl-popup-close-button {
          font-size: 22px;
          padding: 6px 10px;
          right: 5px;
          top: 5px;
          color: #6366f1;
          line-height: 1;
        }
        .mapboxgl-popup-close-button:hover {
          background-color: transparent;
          color: #4f46e5;
        }
        .popup-content .max-h-72::-webkit-scrollbar {
          width: 6px;
        }
        .popup-content .max-h-72::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .popup-content .max-h-72::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .popup-content .max-h-72::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        .custom-marker {
          cursor: pointer;
        }
        .custom-marker:hover {
          z-index: 100;
        }
        .marker-container {
          position: relative;
        }
        .marker-pointer {
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #8B5CF6;
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
        }
      `}</style>

      {/* Simplified control panel with just the view mode toggle */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-4">
            {/* Toggle switch */}
            <div className="flex items-center">
              <span className={`mr-2 text-sm font-medium ${viewMode === 'sale' ? 'text-violet-700' : 'text-gray-500'}`}>
                Venta
              </span>
              <div 
                onClick={toggleViewMode}
                className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer"
              >
                <span className="sr-only">Toggle view mode</span>
                <span 
                  className={`${
                    viewMode === 'rent' ? 'bg-yellow-500' : 'bg-violet-600'
                  } absolute inset-0 rounded-full transition-colors`}
                ></span>
                <span
                  className={`${
                    viewMode === 'rent' ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                ></span>
              </div>
              <span className={`ml-2 text-sm font-medium ${viewMode === 'rent' ? 'text-yellow-600' : 'text-gray-500'}`}>
                Renta
              </span>
            </div>
            
            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* Count information */}
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${viewMode === 'rent' ? 'bg-yellow-500' : 'bg-violet-600'}`}></div>
              <span className="text-sm font-medium whitespace-nowrap">
                {viewMode === 'rent' 
                  ? `${locations.reduce((sum, loc) => sum + loc.forRent, 0)} propiedades en renta en Zibatá` 
                  : `${locations.reduce((sum, loc) => sum + loc.forSale, 0)} propiedades en venta en Zibatá`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div
        ref={mapContainer}
        className="w-full h-[800px] rounded-xl shadow-md"
      />
    </div>
  );
}
