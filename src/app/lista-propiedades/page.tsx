"use client";

import { useEffect, useState } from 'react';
import { PropertyData, getProperties } from '../services/firebase';
import Link from 'next/link';

export default function ListaPropiedades() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (err) {
        setError('Error al cargar las propiedades');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Propiedades Disponibles</h1>
        <Link 
          href="/crearPropiedad" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Crear Nueva Propiedad
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Link href={`/crearPropiedad?id=${property.id}`} className="block hover:opacity-95 transition-opacity">
              {/* Image Carousel */}
              <div className="relative h-48">
                {property.imageUrls && property.imageUrls.length > 0 ? (
                  <img
                    src={property.imageUrls[0]}
                    alt={`${property.propertyType} en ${property.zone}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>
              
              {/* Property Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">
                    {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {property.transactionType}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-2">{property.zone}</p>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  ${property.price.toLocaleString()}
                </p>
                
                <div className="flex items-center gap-4 text-gray-600">
                  <span>{property.bedrooms} recámaras</span>
                  <span>{property.bathrooms} baños</span>
                  {property.furnished && <span>Amueblado</span>}
                </div>
                
                <div className="mt-4 text-sm text-gray-500">
                  Asesor: {property.advisor}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}