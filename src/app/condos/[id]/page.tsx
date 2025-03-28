"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getCondoById, getZoneById } from '@/app/shared/firebase';
import { CondoData, ZoneData } from '@/app/shared/interfaces';
import CondoSection from '@/app/propiedad/[id]/components/CondoSection';
import ZibataMap from '@/app/components/ZibataMap';

export default function CondoDetailPage() {
  const params = useParams();
  const condoId = params.id as string;
  
  const [condo, setCondo] = useState<CondoData | null>(null);
  const [zone, setZone] = useState<ZoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zibata-related zones (add any specific IDs that should show the Zibata map)
  const ZIBATA_ZONE_IDS = ["zibata", "zivata"]; // Add actual zone IDs from your DB
  
  const isZibataZone = zone ? 
    ZIBATA_ZONE_IDS.includes(zone.id || '') || 
    zone.name.toLowerCase().includes("zibata") : 
    false;

  useEffect(() => {
    async function fetchCondoData() {
      try {
        setLoading(true);
        // Fetch the condominium data
        const condoData = await getCondoById(condoId);
        
        if (!condoData) {
          setError("El condominio solicitado no existe.");
          setLoading(false);
          return;
        }
        
        setCondo(condoData);
        
        // If we have a zoneId, fetch the zone data as well
        if (condoData.zoneId) {
          const zoneData = await getZoneById(condoData.zoneId);
          setZone(zoneData);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching condominium:", err);
        setError("Ocurrió un error al cargar la información del condominio.");
      } finally {
        setLoading(false);
      }
    }

    if (condoId) {
      fetchCondoData();
    }
  }, [condoId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error || !condo) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error || "No se pudo cargar el condominio"}</p>
          <Link href="/condos" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver a lista de condominios
          </Link>
        </div>
      </div>
    );
  }

  // Determine the cover image to display
  const coverImage = condo.portada || 
                    (condo.imageUrls && condo.imageUrls.length > 0 ? condo.imageUrls[0] : null) || 
                    condo.logoUrl;

  return (
    <>
      {/* Hero banner with cover image - constrained width */}
      <div className="container mx-auto px-4">
        {coverImage && (
          <div className="relative max-w-6xl mx-auto h-[40vh] md:h-[50vh] mb-8 overflow-hidden rounded-lg mt-8">
            <img 
              src={coverImage} 
              alt={`${condo.name} - Portada`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h1 className="text-3xl md:text-4xl font-bold drop-shadow-md">{condo.name}</h1>
            </div>
          </div>
        )}
      </div>
      
      <div className='bg-red-200 p-10'>{condo.polygonId}</div>
      
      <div className="container mx-auto px-4 py-8">
        {zone && (
          <div className="mb-6 max-w-6xl mx-auto">
            <Link href="/zonas" className="text-blue-600 hover:underline">Zonas</Link>
            <span className="mx-2 text-gray-400">&gt;</span>
            <Link href={`/zonas/${zone.id}`} className="text-blue-600 hover:underline">{zone.name}</Link>
          </div>
        )}
        
        <div className="max-w-6xl mx-auto">
          <CondoSection condoData={condo} />
          
          {/* Display Zibata map for Zibata-related condominiums */}
          {isZibataZone && (
            <div className="mt-12 mb-12">
              <h2 className="text-xl font-semibold mb-4">Mapa interactivo de {zone?.name || "Zibata"}</h2>
              <div className="bg-white rounded-lg shadow-md overflow-hidden h-[80vh]">
                <ZibataMap highlightedPolygonId={condo.polygonId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
