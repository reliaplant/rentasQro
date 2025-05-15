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
  rentPriceMin?: number;
  rentPriceMax?: number;
  salePriceMin?: number;
  salePriceMax?: number;
}

type ViewMode = 'rent' | 'sale';

export default function MapComponent() {
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