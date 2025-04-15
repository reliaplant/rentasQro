"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getPropertiesByAdvisor, getZones, deleteProperty } from '@/app/shared/firebase';
import type { PropertyData, ZoneData } from '@/app/shared/interfaces'; 
import Image from 'next/image';

export default function MisPropiedades() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zonesData, setZonesData] = useState<Record<string, string>>({});
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  // Click handler for outside menu clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (openMenuId && !(event.target as Element).closest('.menu-container')) {
        setOpenMenuId(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

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

  // Handler for status change
  const handleStatusChange = (propertyId: string, newStatus: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigating to property details
    // Here you would implement the actual status change in your database
    setProperties(prevProperties => 
      prevProperties.map(prop => 
        prop.id === propertyId ? { ...prop, status: newStatus as any } : prop
      )
    );
  };

  // Handler for delete property
  const handleDeleteProperty = async (propertyId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigating to property details
    if (confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      try {
        // Call Firebase service to delete the property
        await deleteProperty(propertyId);
        // Update local state after successful deletion
        setProperties(prevProperties => 
          prevProperties.filter(prop => prop.id !== propertyId)
        );
      } catch (error) {
        console.error("Error al eliminar la propiedad:", error);
        alert("Hubo un error al eliminar la propiedad. Por favor intenta de nuevo.");
      }
    }
    setOpenMenuId(null);
  };

  // Toggle menu visibility
  const toggleMenu = (propertyId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigating to property details
    setOpenMenuId(openMenuId === propertyId ? null : propertyId);
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
                      {/* Property ID Badge */}
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-gray-800/80 text-white text-xs font-mono px-2 py-0.5 rounded-md">
                          #{(property.id ?? '').substring(0, 5)}
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

                      {/* Status Chip and Actions */}
                      <div className="flex justify-between items-center pt-2">
                        {/* Status Change Dropdown */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <select 
                            className="appearance-none text-xs font-medium rounded-full px-3 py-1 pl-6 bg-gray-100 border border-gray-200 cursor-pointer pr-8 text-gray-700"
                            value={property.status}
                            onChange={(e) => property.id && handleStatusChange(property.id, e.target.value, e as unknown as React.MouseEvent)}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: 'right 0.25rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.5em 1.5em'
                            }}
                          >
                            <option value="borrador">En Borrador</option>
                            <option value="publicada">Publicada</option>
                            <option value="en_cierre">En Cierre</option>
                            <option value="vendida">Vendida</option>
                            <option value="descartada">Descartada</option>
                          </select>
                          <div 
                            className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full ${statusColors[property.status as keyof typeof statusColors]}`}
                          ></div>
                        </div>

                        {/* Three-dot Menu */}
                        <div className="menu-container relative">
                          <button 
                            onClick={(e) => property.id && toggleMenu(property.id, e)} 
                            className="p-1 rounded-full hover:bg-gray-100"
                          >
                            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>
                          
                          {openMenuId === property.id && (
                            <div className="absolute right-0 mt-1 py-1 bg-white rounded-lg shadow-lg border border-gray-200 z-20 w-36">
                              <button 
                                onClick={(e) => property.id && handleDeleteProperty(property.id, e)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
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