"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getPropertiesByAdvisor, getZones } from '@/app/shared/firebase';
import type { PropertyData, ZoneData } from '@/app/shared/interfaces'; 
import Image from 'next/image';

export default function MisPropiedades() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zonesData, setZonesData] = useState<Record<string, string>>({});

  // Filters state
  const [zoneFilter, setZoneFilter] = useState<string>('');
  const [complexFilter, setComplexFilter] = useState<string>('');

  // Extract unique zones and complexes for filters
  const zones = useMemo(() => {
    const uniqueZones = new Set(properties.map(p => p.zone));
    return Array.from(uniqueZones);
  }, [properties]);

  const complexes = useMemo(() => {
    const uniqueComplexes = new Set(properties.map(p => p.condo).filter(Boolean));
    return Array.from(uniqueComplexes as Set<string>);
  }, [properties]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // Load properties and zones in parallel
        const [userProperties, zonesResult] = await Promise.all([
          getPropertiesByAdvisor(user.uid),
          getZones()
        ]);

        // Fix the type issue with the zones map
        const zonesMap: Record<string, string> = {};
        zonesResult.forEach(zone => {
          if (zone.id) {
            zonesMap[zone.id] = zone.name;
          }
        });

        setZonesData(zonesMap);
        setProperties(userProperties);
      } catch (err) {
        setError('Error al cargar las propiedades');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  // Apply filters to properties
  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (zoneFilter && p.zone !== zoneFilter) return false;
      if (complexFilter && p.condo !== complexFilter) return false;
      return true;
    });
  }, [properties, zoneFilter, complexFilter]);

  // Updated columns configuration with filtered properties
  const columns = {
    borrador: filteredProperties.filter(p => p.status === 'borrador'),
    publicada: filteredProperties.filter(p => p.status === 'publicada'),
    en_cierre: filteredProperties.filter(p => p.status === 'en_cierre'),
    vendida: filteredProperties.filter(p => p.status === 'vendida'),
    descartada: filteredProperties.filter(p => p.status === 'descartada')
  };

  const statusColors = {
    borrador: 'bg-violet-200',
    publicada: 'bg-violet-500',
    en_cierre: 'bg-violet-800',
    vendida: 'bg-emerald-500',
    descartada: 'bg-gray-400'
  };

  const statusBgColors = {
    borrador: 'bg-violet-50',
    publicada: 'bg-violet-100',
    en_cierre: 'bg-violet-200',
    vendida: 'bg-emerald-50',
    descartada: 'bg-red-50'
  };

  const statusLabels = {
    borrador: 'En Borrador',
    publicada: 'Publicada',
    en_cierre: 'En Cierre',
    vendida: 'Vendida',
    descartada: 'Descartada'
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        {Object.entries(columns).map(([status, items]) => (
          <div key={status} className="flex-1 min-w-0 flex flex-col border-r last:border-r-0 border-gray-200 bg-gray-50/80">
            {/* Column header */}
            <div className="px-3 py-2 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></div>
                  <span className="font-medium text-sm text-gray-900">
                    {statusLabels[status as keyof typeof statusLabels]}
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{items.length}</span>
              </div>
            </div>
            
            {/* Column content */}
            <div className="flex-1 overflow-y-auto p-2">
              {items.map((property) => (
                <div
                  key={property.id}
                  onClick={() => router.push(`/asesor/crearPropiedad?id=${property.id}`)}
                  className="bg-white border border-gray-200 rounded-xl mb-2 cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col">
                    {/* Image container with status badge */}
                    <div className="relative aspect-[16/12]">
                      <Image
                        src={property.imageUrls[0] || '/placeholder-property.jpg'}
                        alt={`${property.propertyType} en ${zonesData[property.zone] || 'zona no especificada'}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover rounded-t-xl"
                        priority={false}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-property.jpg';
                        }}
                      />
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                          {property.transactionType === 'renta' ? 'En renta' : 'En venta'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {property.propertyType === 'departamento' ? 'Depa' : 'Casa'}{' '}
                            {property.transactionType === 'renta' ? 'en Renta' : 'en Venta'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {property.condoName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {zonesData[property.zone] || 'Zona no especificada'}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-violet-800">
                          ${property.price.toLocaleString()}
                          {property.transactionType === 'renta' && <span className="text-gray-500 text-xs">/mes</span>}
                        </div>
                      </div>
                      
                      {/* Property details */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{property.bedrooms} rec</span>
                        <span>•</span>
                        <span>{property.bathrooms} baños</span>
                        <span>•</span>
                        <span>{property.construccionM2}m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}