'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PropertyData } from '@/app/shared/interfaces';
import PropertyCard from '@/app/components/PropertyCard';

interface PropertiesSectionProps {
  properties: PropertyData[];
  condoName: string;
}

// Updated PreventaBanner component with solid dark gray background and white text
const PreventaBanner = () => {
  return (
    <div className="mb-6 p-4 sm:p-6 rounded-xl bg-gray-800 text-white shadow-lg">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-semibold !text-white">¿Sabías que invertir en preventa tiene beneficios económicos?</h3>
          <p className="text-sm sm:text-base !text-white opacity-90">
            Aprovecha precios más bajos, planes de pago flexibles y mayor plusvalía a futuro.
          </p>
        </div>
        <Link
          href="/contacto"
          className="whitespace-nowrap px-4 py-2 bg-white text-gray-800 font-medium rounded-lg shadow hover:bg-gray-100 transition-colors duration-200"
        >
          Contactar asesor
        </Link>
      </div>
    </div>
  );
};

export default function PropertiesSection({ properties, condoName }: PropertiesSectionProps) {
  // Instead of returning null, show a message when there are no properties
  if (!properties || properties.length === 0) {
    return (
      <div className="px-4 md:px-0 my-12">
        <h3 className="text-xl pb-4 font-semibold mb-2 md:mb-3">Propiedades en {condoName}</h3>
        <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
          <p className="text-gray-600 text-base md:text-lg mb-4">
            No hay propiedades disponibles en {condoName} en este momento.
          </p>
          <Link 
            href="/qro/buscar" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200 "
          >
            Explora otras propiedades
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // Separate properties by transaction type and preventa status
  const rentProperties = properties
    .filter(p => (p.transactionType === 'renta' || p.transactionType === 'ventaRenta') && !p.preventa)
    .slice(0, 4);
  
  const saleProperties = properties
    .filter(p => (p.transactionType === 'venta' || p.transactionType === 'ventaRenta') && !p.preventa)
    .slice(0, 4);
    
  // New filter for preventa properties (pre-sale)
  const preventaProperties = properties
    .filter(p => p.preventa === true)
    .slice(0, 4);

  // Component to render a row of properties
  const PropertyRow = ({ properties, title, isPreventa = false }: { properties: PropertyData[], title: string, isPreventa?: boolean }) => {
    // Don't render anything if no properties of this type
    if (properties.length === 0) {
      return null;
    }
    
    return (
      <div className="mb-12">
        <h3 className="text-xl pb-4 font-semibold mb-2 md:mb-3">{title}</h3>
        
        {/* Display banner only in the preventa section, right after the title */}
        {isPreventa && <PreventaBanner />}
        
        <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 ${isPreventa ? 'mt-6' : ''}`}>
          {properties.map((property, index) => (
            <PropertyCard 
              key={property.id || index}
              property={property} 
              index={index}
              currency="MXN"
              linkTo={`/qro/propiedades/${property.id}`}
              type="compact"
              size={index < 2 ? 'default' : 'default'}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="">
      {/* Only render sections that have properties */}
      {preventaProperties.length > 0 && (
        <PropertyRow 
          properties={preventaProperties} 
          title={`Propiedades en preventa`}
          isPreventa={true} // Pass flag to indicate this is the preventa section
        />
      )}
      
      {saleProperties.length > 0 && (
        <PropertyRow 
          properties={saleProperties} 
          title={`Propiedades en venta`} 
        />
      )}
      
      {rentProperties.length > 0 && (
        <PropertyRow 
          properties={rentProperties} 
          title={`Propiedades en renta`} 
        />
      )}
      
      {/* Show message if no properties in any category */}
      {preventaProperties.length === 0 && saleProperties.length === 0 && rentProperties.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 md:p-12 text-center">
          <p className="text-gray-600 text-base md:text-lg mb-4">
            No hay propiedades disponibles en {condoName} en este momento.
          </p>
          <Link 
            href="/qro/buscar" 
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200"
          >
            Explora propiedades
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
}
