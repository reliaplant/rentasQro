'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getZoneById, getZoneCondos } from '@/app/shared/firebase';
import { resumenCondo } from '@/app/shared/interfaces';

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
}

type ViewMode = 'rent' | 'sale';

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('rent');

  // Fetch condos data from Firebase
  useEffect(() => {
    const fetchCondos = async () => {
      try {
        setLoading(true);
        
        // Updated to use the correct zone ID
        const ZIBATA_ZONE_ID = 'X5oWujYupjRKx0tF8Hlj'; // New zone ID provided by user
        console.log('Fetching zone data with ID:', ZIBATA_ZONE_ID);
        
        // Get zone data
        const zoneData = await getZoneById(ZIBATA_ZONE_ID);
        if (!zoneData) {
          console.error('Zone not found with ID:', ZIBATA_ZONE_ID);
          throw new Error('Zone not found');
        }
        
        console.log('Zone data found:', zoneData.name);
        
        // Get condos from the zone document
        const zoneCondos = await getZoneCondos(ZIBATA_ZONE_ID);
        console.log('Raw condos from zone:', zoneCondos);
        
        if (!zoneCondos || zoneCondos.length === 0) {
          console.warn('No condos found in zone');
        }
        
        // Filter out condos with (0,0) coordinates or invalid coordinates
        const validCondos = zoneCondos.filter((condo: resumenCondo) => 
          condo && 
          condo.coordX !== undefined && 
          condo.coordY !== undefined && 
          !(condo.coordX === 0 && condo.coordY === 0)
        );
        
        console.log('Valid condos with non-zero coordinates:', validCondos.length);
        
        if (validCondos.length === 0) {
          setError('No se encontraron condominios con ubicación válida');
          setLoading(false);
          return;
        }
        
        // Convert to the Location format
        const mappedLocations = validCondos.map((condo: resumenCondo) => ({
          name: condo.condoName,
          description: '', // No description in the data yet
          coordinates: [condo.coordX, condo.coordY] as [number, number],
          // Use actual property counts from the data
          forRent: condo.propiedadesEnRenta || 0,
          forSale: condo.propiedadesEnVenta || 0,
          condoId: condo.condoId,
          propiedadesRentaResumen: condo.propiedadesRentaResumen || [],
          propiedadesVentaResumen: condo.propiedadesVentaResumen || []
        }));
        
        setLocations(mappedLocations);
        console.log('Loaded', mappedLocations.length, 'condos for the map');
      } catch (err) {
        console.error('Error fetching condos:', err);
        setError('Failed to load condominium data: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCondos();
  }, []);

  // Update map when view mode changes
  useEffect(() => {
    if (!map.current || locations.length === 0) return;
    
    // Update the data source if it exists
    const source = map.current.getSource('locations') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(createGeoJSON(locations, viewMode));
    }
  }, [viewMode, locations]);

  // Create GeoJSON with property count based on current view mode
  const createGeoJSON = (locations: Location[], mode: ViewMode) => {
    return {
      type: "FeatureCollection" as const,
      features: locations.map(location => ({
        type: "Feature" as const,
        properties: {
          name: location.name,
          description: location.description || '',
          propertyCount: mode === 'rent' ? location.forRent : location.forSale,
          forRent: location.forRent,
          forSale: location.forSale,
          condoId: location.condoId,
          propiedadesRentaResumen: location.propiedadesRentaResumen,
          propiedadesVentaResumen: location.propiedadesVentaResumen
        },
        geometry: {
          type: "Point" as const,
          coordinates: location.coordinates
        }
      }))
    };
  };

  // Initialize map once locations are loaded
  useEffect(() => {
    if (map.current || !mapContainer.current || loading) return;
    if (locations.length === 0) {
      console.log('No locations to display on map');
      return;
    }

    // Initialize map
    const initMap = () => {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: locations[0]?.coordinates || [-100.353529, 20.684225], // Use first location or default
        zoom: 15,
      });

      // Wait for map to load before adding data
      map.current.on('load', () => addLocationLayers());
    };

    // Add all necessary layers to the map
    const addLocationLayers = () => {
      if (!map.current) return;
      
      // Convert data to GeoJSON based on current viewMode
      const locationsGeoJSON = createGeoJSON(locations, viewMode);
      
      // Add single data source
      map.current.addSource('locations', {
        type: 'geojson',
        data: locationsGeoJSON
      });
      
      // Add shadow layer
      map.current.addLayer({
        id: 'house-count-shadows',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': 20,
          'circle-color': '#000000',
          'circle-opacity': 0.5,
          'circle-blur': 1.5,
          'circle-translate': [2, 3]
        }
      });
      
      // Add main circles
      map.current.addLayer({
        id: 'house-count-circles',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': 15,
          'circle-color': [
            'case',
            ['==', ['get', 'propertyCount'], 0],
            '#cccccc', // Gray for zero count
            viewMode === 'rent' ? '#4F46E5' : '#16A34A' // Blue for rent, Green for sale
          ],
          'circle-opacity': 0.9,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff'
        }
      });
      
      // Add count numbers
      map.current.addLayer({
        id: 'house-count-numbers',
        type: 'symbol',
        source: 'locations',
        layout: {
          'text-field': ['get', 'propertyCount'],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-allow-overlap': true
        },
        paint: {
          'text-color': '#ffffff'
        }
      });
      
      // Set up interaction handlers
      setupInteractions();
    };
    
    // Set up all map interactions
    const setupInteractions = () => {
      if (!map.current) return;
      
      // Click handler for popups
      map.current.on('click', 'house-count-circles', (e) => {
        if (!map.current || !e.features?.length) return;
        
        // Extract coordinates from the clicked feature
        const feature = e.features[0];
        // Type guard to ensure the geometry is a Point with coordinates
        if (feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates.slice() as [number, number];
          const props = feature.properties;
          
          if (props) {
            createLocationPopup(coordinates, props);
          }
        }
      });
      
      // Cursor handlers
      map.current.on('mouseenter', 'house-count-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      
      map.current.on('mouseleave', 'house-count-circles', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    };
    
    // Create and display a popup for a location
    const createLocationPopup = (coordinates: [number, number], properties: any) => {
      if (!map.current) return;
      
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <h3 class="font-bold text-lg">${properties.name}</h3>
          <p>${properties.description || ''}</p>
          <div class="mt-2">
            <p>En renta: <b>${properties.forRent}</b> ${properties.forRent > 0 ? 'propiedades' : 'propiedad'}</p>
            <p>En venta: <b>${properties.forSale}</b> ${properties.forSale > 0 ? 'propiedades' : 'propiedad'}</p>
            <a href="/condominio/${properties.condoId}" class="text-blue-600 hover:underline mt-2 block">
              Ver detalles
            </a>
          </div>
        `)
        .addTo(map.current);
    };

    // Initialize the map
    initMap();

    // Cleanup on unmount
    return () => {
      map.current?.remove();
    };
  }, [loading, locations]);

  // Toggle view mode between rent and sale
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'rent' ? 'sale' : 'rent');
    
    // Update the circle colors when toggling
    if (map.current) {
      const newColor = viewMode === 'sale' ? '#4F46E5' : '#16A34A';
      map.current.setPaintProperty('house-count-circles', 'circle-color', [
        'case',
        ['==', ['get', 'propertyCount'], 0],
        '#cccccc', // Gray for zero count
        newColor
      ]);
    }
  };

  if (error) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl text-red-600 mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center">
          <h3 className="text-xl mb-2">Cargando mapa...</h3>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Toggle Button */}
      <div className="absolute top-4 right-4 z-10">
        <button 
          onClick={toggleViewMode}
          className={`px-4 py-2 rounded-lg shadow-md font-medium transition-colors ${
            viewMode === 'rent' 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          Mostrar propiedades en {viewMode === 'rent' ? 'venta' : 'renta'}
        </button>
      </div>
      
      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white p-3 rounded-lg shadow-md">
        <h3 className="font-medium text-sm mb-1">
          Propiedades en {viewMode === 'rent' ? 'renta' : 'venta'}
        </h3>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full mr-2 ${viewMode === 'rent' ? 'bg-indigo-600' : 'bg-green-600'}`}></div>
          <span className="text-xs">Cantidad disponible</span>
        </div>
      </div>
      
      <div
        ref={mapContainer}
        className="w-full h-[600px] rounded-xl shadow-md"
      />
    </div>
  );
}