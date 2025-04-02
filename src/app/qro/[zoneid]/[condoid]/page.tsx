"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getZoneByName, getCondosByZone } from '@/app/shared/firebase';
import { ZoneData, CondoData } from '@/app/shared/interfaces';
import CondoSection from '@/app/propiedad/[id]/components/CondoSection';
import ZibataMap from '@/app/components/ZibataMap';

export default function CondoDetailPage() {
  const params = useParams<{ zoneid: string; condoid: string }>();
  const zoneName = params?.zoneid || '';
  const condoName = params?.condoid || '';
  
  const [condo, setCondo] = useState<CondoData | null>(null);
  const [zone, setZone] = useState<ZoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ZIBATA_ZONE_NAMES = ["zibata", "zivata"];
  const isZibataZone = zoneName ? ZIBATA_ZONE_NAMES.includes(zoneName.toLowerCase()) : false;

  useEffect(() => {
    async function fetchData() {
      if (!zoneName || !condoName) {
        setError("URL inválida");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First get the zone
        const zoneData = await getZoneByName(zoneName);
        if (!zoneData) {
          setError(`No se encontró la zona "${zoneName}"`);
          return;
        }
        setZone(zoneData);

        // Then get all condos for this zone and find the matching one by name
        const condosData = await getCondosByZone(zoneData.id || '');
        const matchingCondo = condosData.find(c => 
          c.name.toLowerCase().replace(/\s+/g, '-') === condoName.toLowerCase()
        );

        if (!matchingCondo) {
          setError(`No se encontró el condominio "${condoName}" en ${zoneName}`);
          return;
        }

        setCondo(matchingCondo);
        setError(null);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Ocurrió un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [zoneName, condoName]);

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
