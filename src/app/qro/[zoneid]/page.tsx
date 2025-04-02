"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getZoneByName, getCondosByZone } from '@/app/shared/firebase';  // Update import
import { ZoneData, CondoData } from '@/app/shared/interfaces';
import ZibataMap from '@/app/components/ZibataMap';

export default function ZoneDetailPage() {
  // Fix the type for params and zoneName
  const params = useParams<{ zoneid: string }>();
  const zoneName = params?.zoneid || '';

  const [zone, setZone] = useState<ZoneData | null>(null);
  const [condos, setCondos] = useState<CondoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const ZIBATA_ZONE_NAMES = ["zibata", "zivata"];
  const isZibataZone = zoneName ? ZIBATA_ZONE_NAMES.includes(zoneName.toLowerCase()) : false;

  useEffect(() => {
    async function fetchZoneData() {
      if (!zoneName) {
        setError("No se proporcionó una zona válida");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const zoneData = await getZoneByName(zoneName);
        
        if (!zoneData) {
          setError(`No se encontró la zona "${zoneName}"`);
          return;
        }
        
        setZone(zoneData);
        // Use the found zone's ID to get condos
        const condosData = await getCondosByZone(zoneData.id || '');
        setCondos(condosData);
        setError(null);
      } catch (err) {
        console.error("Error fetching zone:", err);
        setError("Ocurrió un error al cargar los datos de la zona.");
      } finally {
        setLoading(false);
      }
    }

    fetchZoneData();
  }, [zoneName]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error || "No se pudo cargar la zona"}</p>
          <Link href="/zonas" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver a lista de zonas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/zonas" className="text-blue-600 hover:underline mb-2 inline-block">
          ← Volver a zonas
        </Link>
        <h1 className="text-3xl font-bold mt-2">{zone.name}</h1>
      </div>

      {/* Display Zibata map for Zibata zone */}
      {isZibataZone && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Mapa interactivo de {zone.name}</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[80vh]">
            <ZibataMap />
          </div>
        </div>
      )}
      
      {/* Display condos in this zone */}
      <div>
        <h2 className="text-xl font-semibold mb-6">Condominios en {zone.name}</h2>
        
        {condos.length === 0 ? (
          <p className="text-gray-500">No hay condominios disponibles en esta zona.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {condos.map((condo) => {
              const coverImage = condo.portada || 
                               (condo.imageUrls && condo.imageUrls.length > 0 ? condo.imageUrls[0] : null) || 
                               condo.logoUrl;
              
              // Convertir el nombre del condo a formato URL (slug)
              const condoSlug = condo.name.toLowerCase().replace(/\s+/g, '-');
              
              return (
                <Link href={`/qro/${zoneName}/${condoSlug}`} key={condo.id}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer">
                    {coverImage && (
                      <div className="relative h-40 bg-gray-100 rounded-t-lg overflow-hidden">
                        <img 
                          src={coverImage} 
                          alt={condo.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1">{condo.name}</h3>
                      {condo.shortDescription && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {condo.shortDescription}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
