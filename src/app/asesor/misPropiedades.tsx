"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { getCurrentUser, getPropertiesByAdvisor, updateProperty } from '@/app/shared/firebase';
import type { PropertyData } from '@/app/shared/interfaces'; 

export default function MisPropiedades() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    const loadProperties = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const userProperties = await getPropertiesByAdvisor(user.uid);
        setProperties(userProperties);
      } catch (err) {
        setError('Error al cargar las propiedades');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
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
    borrador: 'bg-gray-400',
    publicada: 'bg-green-400',
    en_cierre: 'bg-yellow-400',
    vendida: 'bg-blue-400',
    descartada: 'bg-red-400'
  };

  const statusLabels = {
    borrador: 'En Borrador',
    publicada: 'Publicada',
    en_cierre: 'En Cierre',
    vendida: 'Vendida',
    descartada: 'Descartada'
  };

  // Calculate totals for each column
  const columnTotals = Object.entries(columns).reduce((acc, [status, items]) => ({
    ...acc,
    [status]: items.reduce((sum, prop) => sum + (prop.price || 0), 0)
  }), {} as Record<string, number>);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    try {
      const newStatus = destination.droppableId as PropertyData['status'];
      await updateProperty(draggableId, { status: newStatus });
      
      // Update local state
      setProperties(properties.map(prop => 
        prop.id === draggableId ? { ...prop, status: newStatus } : prop
      ));
    } catch (error) {
      setError('Error al actualizar el estado');
    }
  };

  const clearFilters = () => {
    setZoneFilter('');
    setComplexFilter('');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen">


      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-1 overflow-hidden">
          {Object.entries(columns).map(([status, items]) => (
            <div key={status} className="flex-1 min-w-0 flex flex-col border-r last:border-r-0 border-gray-200 bg-gray-50">
              {/* Column header */}
              <div className="px-3 py-2 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status as keyof typeof statusColors]}`}></div>
                    <span className="font-medium text-sm">
                      {statusLabels[status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{items.length}</span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  <span>${columnTotals[status].toLocaleString()}</span>
                </div>
              </div>
              
              {/* Column content with internal scroll */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 overflow-y-auto p-2 ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : ''
                    }`}
                  >
                    {items.map((property, index) => (
                      <Draggable 
                        key={property.id} 
                        draggableId={property.id!} 
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => router.push(`/crearPropiedad?id=${property.id}`)}
                            className={`bg-white border border-gray-200 mb-2 cursor-pointer hover:shadow-sm transition-all ${
                              snapshot.isDragging ? 'shadow-md ring-1 ring-blue-400' : ''
                            }`}
                          >
                            <div className="flex flex-col">
                              <img
                                src={property.imageUrls[0]}
                                alt={`${property.propertyType} en ${property.zone}`}
                                className="w-full h-28 object-cover"
                              />
                              
                              <div className="p-2.5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="text-sm font-medium">
                                      {property.propertyType === 'casa' ? 'Casa' : 'Depto'}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {property.zone}
                                      {property.condo && (
                                        <span className="block text-gray-500 truncate max-w-[130px]">
                                          {property.condo}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-sm font-bold text-blue-600">
                                    ${property.price.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}