"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getZones } from '@/app/shared/firebase';
import { ZoneData } from '@/app/shared/interfaces';

export default function ZonasPage() {
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchZones() {
      try {
        setLoading(true);
        const zonesData = await getZones();
        setZones(zonesData);
        setError(null);
      } catch (err) {
        console.error("Error fetching zones:", err);
        setError("No fue posible cargar las zonas. Intente más tarde.");
      } finally {
        setLoading(false);
      }
    }

    fetchZones();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Zonas Disponibles en Querétaro
        </h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando zonas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          Zonas Disponibles en Querétaro
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
        Zonas Disponibles en Querétaro
      </h1>
      
      {zones.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No hay zonas disponibles en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <Link href={`/zonas/${zone.id}`} key={zone.id}>
              <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full cursor-pointer">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{zone.name}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
