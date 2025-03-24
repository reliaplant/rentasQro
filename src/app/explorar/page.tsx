"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProperties } from '@/app/services/firebase';
import {  PropertyData} from '@/app/interfaces';

// Define Nubank-inspired color palette
const colors = {
  primary: '#8A05BE',
  primaryLight: '#A64FD5',
  primaryDark: '#6D039A',
  background: '#F5F5F7',
  white: '#FFFFFF',
  textDark: '#333333',
  textLight: '#666666',
  border: '#E0E0E0',
};

// Property types for filter
const propertyTypes = [
  { id: 'casa', label: 'Casa' },
  { id: 'departamento', label: 'Departamento' },
  { id: 'terreno', label: 'Terreno' },
  { id: 'oficina', label: 'Oficina' },
  { id: 'local', label: 'Local Comercial' },
];

// Zones for filter
const zones = [
  'Juriquilla',
  'Zibatá',
  'El Refugio',
  'Centro',
  'Cañadas',
  'Milenio',
  'Álamos',
  'Corregidora',
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'all';
  const initialZone = searchParams.get('zone') || '';

  // State
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState<string>(initialType);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [bedroomsMin, setBedroomsMin] = useState<number | null>(null);
  const [bathroomsMin, setBathroomsMin] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(initialZone);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const allProperties = await getProperties();
        
        // Filter out properties with excluded status
        const filteredProperties = allProperties.filter(p => 
          !['borrador', 'descartada', 'vendida', 'en_cierre'].includes(p.status)
        );
        
        setProperties(filteredProperties);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, []);

  // Apply filters to properties
  const filteredProperties = properties.filter(property => {
    // Transaction type filter (rent/sale)
    if (transactionType !== 'all' && !property.transactionTypes?.includes(transactionType)) {
      return false;
    }

    // Property type filter
    if (selectedPropertyTypes.length > 0 && !selectedPropertyTypes.includes(property.propertyType)) {
      return false;
    }

    // Price range filter
    if (property.price < priceRange[0] || property.price > priceRange[1]) {
      return false;
    }

    // Bedrooms filter
    if (bedroomsMin !== null && property.bedrooms < bedroomsMin) {
      return false;
    }

    // Bathrooms filter
    if (bathroomsMin !== null && property.bathrooms < bathroomsMin) {
      return false;
    }

    // Search term (for zone)
    if (searchTerm && !property.zone?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Reset all filters
  const resetFilters = () => {
    setTransactionType('all');
    setSelectedPropertyTypes([]);
    setPriceRange([0, 1000000]);
    setBedroomsMin(null);
    setBathroomsMin(null);
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: 'Montserrat, sans-serif' }}>
      {/* Hero Search Section */}
      <section className="bg-gradient-to-r from-purple-800 to-purple-900 py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Explora Propiedades</h1>
          
          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Transaction Type Tabs */}
              <div className="inline-flex rounded-lg p-1 bg-gray-100 self-stretch">
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'renta', label: 'Renta' },
                  { id: 'venta', label: 'Venta' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      transactionType === tab.id 
                        ? 'bg-white text-purple-800 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    style={transactionType === tab.id ? { color: colors.primary } : {}}
                    onClick={() => setTransactionType(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              
              {/* Search Input */}
              <div className="flex-1 w-full md:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por zona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                  {searchTerm && (
                    <button 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchTerm('')}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Advanced Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtros
                {(selectedPropertyTypes.length > 0 || bedroomsMin || bathroomsMin || priceRange[0] > 0) && (
                  <span className="ml-2 w-5 h-5 flex items-center justify-center bg-purple-600 text-white text-xs rounded-full">
                    {selectedPropertyTypes.length + (bedroomsMin ? 1 : 0) + (bathroomsMin ? 1 : 0) + (priceRange[0] > 0 ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>
            
            {/* Advanced Filters - Collapsible */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Property Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad</label>
                    <div className="flex flex-wrap gap-2">
                      {propertyTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setSelectedPropertyTypes(prev => 
                              prev.includes(type.id)
                                ? prev.filter(t => t !== type.id)
                                : [...prev, type.id]
                            );
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                            selectedPropertyTypes.includes(type.id)
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                          }`}
                          style={selectedPropertyTypes.includes(type.id) ? { 
                            color: colors.primary,
                            backgroundColor: `${colors.primary}15`
                          } : {}}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                    </label>
                    <input 
                      type="range"
                      min="0"
                      max="1000000"
                      step="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${(priceRange[1]/1000000)*100}%, #e5e7eb ${(priceRange[1]/1000000)*100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  
                  {/* Bedrooms & Bathrooms Filter */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Recámaras</label>
                      <div className="flex gap-1">
                        {[null, 1, 2, 3, 4].map((num) => (
                          <button
                            key={num === null ? 'any' : num}
                            onClick={() => setBedroomsMin(num)}
                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                              bedroomsMin === num
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            style={bedroomsMin === num ? { 
                              color: colors.primary,
                              backgroundColor: `${colors.primary}15`
                            } : {}}
                          >
                            {num === null ? 'Todos' : num === 4 ? '4+' : num}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Baños</label>
                      <div className="flex gap-1">
                        {[null, 1, 2, 3].map((num) => (
                          <button
                            key={num === null ? 'any' : num}
                            onClick={() => setBathroomsMin(num)}
                            className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                              bathroomsMin === num
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            style={bathroomsMin === num ? { 
                              color: colors.primary,
                              backgroundColor: `${colors.primary}15`
                            } : {}}
                          >
                            {num === null ? 'Todos' : num === 3 ? '3+' : num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Reset Filters Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {loading ? 'Cargando propiedades...' : `${filteredProperties.length} propiedades encontradas`}
              </h2>
              {!loading && filteredProperties.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Mostrando todas las propiedades disponibles
                </p>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.primary }}></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron propiedades</h3>
              <p className="text-gray-600 mb-6">Intenta cambiar los filtros de búsqueda para ver más resultados.</p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-purple-700 text-white font-medium rounded-lg hover:bg-purple-800 transition-colors shadow-sm"
                style={{ backgroundColor: colors.primary }}
              >
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <Link
                  href={`/propiedad/${property.id}`}
                  key={property.id}
                  className="group block"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Property Image */}
                    <div className="relative aspect-[4/3]">
                      {property.imageUrls && property.imageUrls.length > 0 ? (
                        <Image
                          src={property.imageUrls[0]}
                          alt={property.propertyType || 'Propiedad'}
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                      <div 
                        className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ color: colors.primary }}
                      >
                        {property.transactionTypes?.includes('renta') ? 'Renta' : 'Venta'}
                      </div>
                    </div>
                    
                    {/* Property Info */}
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-800 transition-colors">
                            {property.propertyType}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {property.zone || 'Ubicación no especificada'}
                          </p>
                        </div>
                        <p className="text-xl font-bold" style={{ color: colors.primary }}>
                          ${property.price?.toLocaleString('es-MX')}
                          {property.transactionTypes?.includes('renta') && (
                            <span className="text-xs font-normal text-gray-600">/mes</span>
                          )}
                        </p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-1">🛏️</span>
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">🚿</span>
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">🚗</span>
                          <span>{property.parkingSpots}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}