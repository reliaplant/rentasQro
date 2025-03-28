"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getZones, getCondosByZone } from '@/app/shared/firebase';
import { ZoneData, CondoData } from '@/app/shared/interfaces';

export default function CondosPage() {
  const [condos, setCondos] = useState<CondoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllCondos() {
      try {
        setLoading(true);
        // Primero obtener todas las zonas
        const zones = await getZones();
        
        // Luego obtener los condominios para cada zona
        const condoPromises = zones.map(zone => getCondosByZone(zone.id || ''));
        const condosByZoneArray = await Promise.all(condoPromises);
        
        // Aplanar el array de arrays de condominios
        const allCondos = condosByZoneArray.flat();
        
        setCondos(allCondos);
        setError(null);
      } catch (err) {
        console.error("Error fetching condominiums:", err);
        setError("No fue posible cargar los condominios. Intente más tarde.");
      } finally {
        setLoading(false);
      }
    }

    fetchAllCondos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Condominios en Querétaro
        </h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando condominios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Condominios en Querétaro
        </h1>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">
        Condominios en Querétaro
      </h1>
      
      {condos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay condominios disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {condos.map((condo) => {
            // Determine which image to display, prioritizing portada
            const coverImage = condo.portada || 
                              (condo.imageUrls && condo.imageUrls.length > 0 ? condo.imageUrls[0] : null) || 
                              condo.logoUrl;
            
            return (
              <Link href={`/condos/${condo.id}`} key={condo.id}>
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer">
                  {coverImage && (
                    <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                      <img 
                        src={coverImage} 
                        alt={condo.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2">{condo.name}</h2>
                    {condo.shortDescription && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
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
  );
}
