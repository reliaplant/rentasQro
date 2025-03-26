"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProperties } from '@/app/services/firebase';
import type { PropertyData } from '@/app/interfaces';

// Define Nubank-inspired color palette
const colors = {
  primary: '#8A05BE', // Main purple color
  primaryLight: '#A64FD5', // Lighter purple for hover states
  primaryDark: '#6D039A', // Darker purple for active states
  background: '#F5F5F7', // Very light gray background
  white: '#FFFFFF', // Pure white
  textDark: '#333333', // Dark text for readability
  textLight: '#666666', // Light text for secondary info
  border: '#E0E0E0', // Light border color
};

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'renta' | 'venta'>('renta');
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // Only load published properties with status 'publicada'
        const allProperties = await getProperties();
        const publishedProperties = allProperties.filter(p => p.status === 'publicada');
        setProperties(publishedProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/propiedades?type=${activeTab}${searchLocation ? `&zone=${encodeURIComponent(searchLocation)}` : ''}`);
  };

  // Filter properties based on active tab (rent or sale)
  const filteredProperties = properties.filter(property => {
    if (activeTab === 'renta') {
      return ['renta', 'ventaRenta'].includes(property.transactionType);
    } else {
      return ['venta', 'ventaRenta'].includes(property.transactionType);
    }
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: 'Montserrat, sans-serif' }}>
      {/* Hero Section with Search */}
      <section className="relative flex flex-col items-center justify-center py-32 px-4 overflow-hidden bg-gradient-to-r from-purple-800 to-purple-900">
        <div className="absolute inset-0 opacity-10">
          <Image 
            src="/images/hero-bg.jpg" 
            alt="Background" 
            layout="fill" 
            objectFit="cover"
            priority
          />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
            Encuentra tu próximo hogar
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            La manera más sencilla de encontrar el espacio perfecto para vivir o invertir
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-xl shadow-lg p-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Tabs */}
              <div className="inline-flex rounded-lg p-1 bg-gray-100 self-start">
                {['renta', 'venta'].map((tab) => (
                  <button
                    key={tab}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab 
                        ? 'bg-white text-purple-800 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setActiveTab(tab as 'renta' | 'venta')}
                  >
                    {tab === 'renta' ? 'Renta' : 'Venta'}
                  </button>
                ))}
              </div>
              
              {/* Search input */}
              <form onSubmit={handleSearch} className="flex-1 flex">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="¿Dónde quieres vivir?"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-100 border-0 focus:ring-2 focus:ring-purple-500 text-gray-900"
                  />
                </div>
                <button
                  type="submit"
                  className="ml-2 px-6 py-3 bg-purple-700 text-white font-medium rounded-lg hover:bg-purple-800 transition-colors shadow-sm"
                  style={{ backgroundColor: colors.primary }}
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Propiedades destacadas</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explora nuestras propiedades cuidadosamente seleccionadas que podrían ser tu próximo hogar
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: colors.primary }}></div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-600">No hay propiedades disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.slice(0, 6).map((property) => (
                <Link
                  href={`/propiedad/${property.id}`}
                  key={property.id}
                  className="group block"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md">
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
                      <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-xs font-medium text-purple-800" style={{ color: colors.primary }}>
                        {property.transactionType === 'ventaRenta' 
                          ? 'Venta/Renta' 
                          : property.transactionType === 'renta' 
                            ? 'Renta' 
                            : 'Venta'}
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-800 transition-colors">
                            {property.propertyType}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {property.zone || 'Ubicación no especificada'}
                          </p>
                        </div>
                        <p className="text-xl font-bold" style={{ color: colors.primary }}>
                          ${property.price?.toLocaleString('es-MX')}
                          {property.transactionTypes?.includes('renta') && <span className="text-xs font-normal text-gray-600">/mes</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
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

          {filteredProperties.length > 6 && (
            <div className="text-center mt-12">
              <Link
                href={`/propiedades?type=${activeTab}`}
                className="inline-flex items-center px-6 py-3 border border-purple-600 text-purple-600 bg-white rounded-lg hover:bg-purple-50 transition-colors font-medium"
                style={{ color: colors.primary, borderColor: colors.primary }}
              >
                Ver todas las propiedades
                <svg className="ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 px-4" style={{ backgroundColor: colors.white }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Por qué elegirnos</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simplificamos el proceso de encontrar tu espacio ideal con un enfoque centrado en la experiencia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔍',
                title: 'Búsqueda simplificada',
                description: 'Encuentra propiedades que coincidan exactamente con tus necesidades de forma rápida y sencilla.'
              },
              {
                icon: '🏠',
                title: 'Propiedades verificadas',
                description: 'Todas nuestras propiedades son verificadas por nuestro equipo para garantizar calidad y precisión.'
              },
              {
                icon: '📱',
                title: 'Proceso sin complicaciones',
                description: 'Desde la búsqueda hasta la firma, hacemos que todo el proceso sea transparente y sin sorpresas.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 text-center" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">¿Listo para encontrar tu hogar ideal?</h2>
          <p className="text-white/90 text-lg mb-8">
            Comienza tu búsqueda ahora y descubre el espacio perfecto que se adapte a tu estilo de vida.
          </p>
          <Link 
            href="/propiedades" 
            className="inline-flex items-center px-8 py-4 bg-white text-purple-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: colors.primary }}
          >
            Explorar propiedades
          </Link>
        </div>
      </section>
    </main>
  );
}