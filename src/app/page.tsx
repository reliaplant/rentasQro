"use client";

import { useEffect, useState } from 'react';
import { getProperties } from '@/app/services/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { PropertyData } from '@/app/services/firebase';

// Icons
import { 
  HiOutlineHome, 
  HiOutlineOfficeBuilding, 
  HiOutlineCash, 
  HiOutlineShoppingCart,
  HiOutlineBadgeCheck, 
  HiChevronLeft, 
  HiChevronRight, 
  HiOutlineCurrencyDollar,
  HiOutlineLocationMarker,
  HiOutlineUserGroup
} from 'react-icons/hi';

// Price formatter
const formatPrice = (price: number) => {
  return price.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0
  });
};

export default function Home() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [transactionType, setTransactionType] = useState<string | null>(null);
  const [furnished, setFurnished] = useState<boolean | null>(null);
  const [bedroomsMin, setBedroomsMin] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  
  // Zones list
  const zones = [
    { id: 'zakia', name: 'Zakia' },
    { id: 'refugio', name: 'El Refugio' },
    { id: 'zibata', name: 'Zibatá' }
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
        setFilteredProperties(data);
        
        // Set initial price range based on actual properties
        if (data.length > 0) {
          const prices = data.map(p => p.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange([min, max]);
        }
      } catch (err) {
        setError('Error al cargar las propiedades');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    // Apply filters
    let results = [...properties];
    
    if (propertyType) {
      results = results.filter(p => p.propertyType === propertyType);
    }
    
    if (transactionType) {
      results = results.filter(p => p.transactionType === transactionType);
    }
    
    if (furnished !== null) {
      results = results.filter(p => p.furnished === furnished);
    }
    
    if (bedroomsMin > 0) {
      results = results.filter(p => p.bedrooms >= bedroomsMin);
    }
    
    results = results.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    if (selectedZones.length > 0) {
      results = results.filter(p => selectedZones.includes(p.zone));
    }
    
    setFilteredProperties(results);
  }, [properties, propertyType, transactionType, furnished, bedroomsMin, priceRange, selectedZones]);

  // Image carousel handling
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

  const handleNextImage = (propertyId: string, imagesLength: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) + 1) % imagesLength
    }));
  };

  const handlePrevImage = (propertyId: string, imagesLength: number) => {
    setActiveImageIndex(prev => ({
      ...prev,
      [propertyId]: ((prev[propertyId] || 0) - 1 + imagesLength) % imagesLength
    }));
  };

  const handleZoneToggle = (zoneId: string) => {
    setSelectedZones(prev => {
      if (prev.includes(zoneId)) {
        return prev.filter(z => z !== zoneId);
      } else {
        return [...prev, zoneId];
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Filter Section - First Row */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filtrar propiedades</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Property Type Toggle */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-2">Tipo de inmueble</label>
            <div className="flex rounded-lg overflow-hidden border">
              <button 
                onClick={() => setPropertyType('casa')}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 ${propertyType === 'casa' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                <HiOutlineHome /> Casa
              </button>
              <button 
                onClick={() => setPropertyType('departamento')}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 ${propertyType === 'departamento' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                <HiOutlineOfficeBuilding /> Depa
              </button>
              {propertyType && (
                <button 
                  onClick={() => setPropertyType(null)}
                  className="py-2 px-3 bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Transaction Type Toggle */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-2">Operación</label>
            <div className="flex rounded-lg overflow-hidden border">
              <button 
                onClick={() => setTransactionType('renta')}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 ${transactionType === 'renta' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                <HiOutlineCash /> Renta
              </button>
              <button 
                onClick={() => setTransactionType('venta')}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 ${transactionType === 'venta' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                <HiOutlineShoppingCart /> Compra
              </button>
              {transactionType && (
                <button 
                  onClick={() => setTransactionType(null)}
                  className="py-2 px-3 bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Furnished Toggle */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-2">Amueblado</label>
            <div className="flex rounded-lg overflow-hidden border">
              <button 
                onClick={() => setFurnished(true)}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 ${furnished === true ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                <HiOutlineBadgeCheck /> Sí
              </button>
              <button 
                onClick={() => setFurnished(false)}
                className={`flex-1 py-2 px-3 flex items-center justify-center gap-1 ${furnished === false ? 'bg-blue-500 text-white' : 'bg-white'}`}
              >
                No
              </button>
              {furnished !== null && (
                <button 
                  onClick={() => setFurnished(null)}
                  className="py-2 px-3 bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Bedrooms Filter */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-2">Recámaras (min.)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="5"
                value={bedroomsMin}
                onChange={(e) => setBedroomsMin(parseInt(e.target.value))}
                className="flex-1 mr-2"
              />
              <span className="bg-blue-100 text-blue-800 rounded-full h-8 w-8 flex items-center justify-center">
                {bedroomsMin}+
              </span>
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-2">Precio</label>
            <div className="flex items-center gap-2">
              <span className="text-xs">{formatPrice(priceRange[0])}</span>
              <input
                type="range"
                min={properties.length > 0 ? Math.min(...properties.map(p => p.price)) : 0}
                max={properties.length > 0 ? Math.max(...properties.map(p => p.price)) : 100000000}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="flex-1"
              />
              <span className="text-xs">{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Zone Chips */}
        <div>
          <label className="text-sm text-gray-600 mb-2 block">Zonas</label>
          <div className="flex flex-wrap gap-2">
            {zones.map(zone => (
              <button
                key={zone.id}
                onClick={() => handleZoneToggle(zone.id)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedZones.includes(zone.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {zone.name}
              </button>
            ))}
            {selectedZones.length > 0 && (
              <button
                onClick={() => setSelectedZones([])}
                className="px-4 py-2 rounded-full text-sm bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad' : 'propiedades'} encontradas
        </h2>
        <Link
          href="/lista-propiedades"
          className="text-blue-500 hover:text-blue-700"
        >
          Ver todas
        </Link>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay propiedades que coincidan con los filtros</h3>
          <p className="text-gray-500">Intenta modificar los filtros para ver más resultados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
          {filteredProperties.map((property) => (
            <Link 
              href={`/propiedad/${property.id}`} 
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow group"
              key={property.id}
            >
              {/* Image Carousel */}
              <div className="relative h-48">
                {property.imageUrls && property.imageUrls.length > 0 ? (
                  <>
                    <img
                      src={property.imageUrls[activeImageIndex[property.id || ''] || 0]}
                      alt={`${property.propertyType} en ${property.zone}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {property.imageUrls.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePrevImage(property.id || '', property.imageUrls.length);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HiChevronLeft size={20} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleNextImage(property.id || '', property.imageUrls.length);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HiChevronRight size={20} />
                        </button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                          {property.imageUrls.map((_, idx) => (
                            <div 
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${
                                (activeImageIndex[property.id || ''] || 0) === idx 
                                  ? 'bg-white' 
                                  : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    
                    {/* Property Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`
                        px-2 py-1 rounded-md text-xs font-medium
                        ${property.transactionType === 'renta' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}
                      `}>
                        {property.transactionType === 'renta' ? 'Renta' : 'Venta'}
                      </span>
                    </div>
                    
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>
              
              {/* Property Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold line-clamp-1">
                    {property.propertyType === 'casa' ? 'Casa' : 'Departamento'}
                    {property.privateComplex && ` en ${property.privateComplex}`}
                  </h3>
                </div>
                
                <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                  <HiOutlineLocationMarker />
                  <span>{property.zone}</span>
                </div>
                
                <p className="text-xl font-bold text-blue-600 mb-3">
                  <HiOutlineCurrencyDollar className="inline align-text-top" size={20} />
                  {formatPrice(property.price)}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{property.bedrooms} recám</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{property.bathrooms} baños</span>
                  </div>
                  
                  {property.furnished && (
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Amueblado</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}