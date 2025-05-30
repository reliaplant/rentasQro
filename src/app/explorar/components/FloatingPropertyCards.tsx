'use client';

import React, { useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import PropertyCard from '@/app/components/PropertyCard';
import { PropertyData } from '@/app/shared/interfaces';

interface FloatingPropertyCardsProps {
  properties: PropertyData[];
  condoName: string;
  onClose: () => void;
  transactionType: 'renta' | 'compra';
}

const FloatingPropertyCards: React.FC<FloatingPropertyCardsProps> = ({ 
  properties, 
  condoName, 
  onClose,
  transactionType 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Skip rendering if there are no properties
  if (!properties.length) return null;
  
  // For debugging
  console.log(`Rendering floating cards for ${properties.length} properties in ${condoName}`);

  return (
    <div className="fixed left-0 right-0 bottom-20 z-[105] px-[10vw]">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden max-h-[500px]">
        {/* Header with condo name */}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <div> 
            <h3 className="font-semibold text-base">{condoName}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-violet-100"
            aria-label="Cerrar"
          >
            <FaTimes className="w-4 h-4 text-gray-800" />
          </button>
        </div>
        
        {/* Horizontal scrollable property cards with zone name enforcement */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-8 px-4 pb-10"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth'
          }}
        >
          {/* Make spacer smaller to ensure first card is not fully centered */}
          <div className="flex-shrink-0" style={{ width: 'calc(50vw - 110px)' }}></div>
          
          {properties.map((property, index) => {
            // Make sure zoneName is defined, if not use a fallback
            if (property.zone === 'X5oWujYupjRKx0tF8Hlj' && !property.zoneName) {
              property.zoneName = 'Zibatá';
            } else if (!property.zoneName) {
              property.zoneName = 'Zona no especificada';
            }
            
            return (
              <div 
                key={property.id || index} 
                className="property-card flex-shrink-0 w-[220px] mx-2"
                style={{ scrollSnapAlign: 'center' }}
              >
                <PropertyCard 
                  property={property}
                  index={index}
                  currency="MXN"
                  className="h-full w-full"
                />
              </div>
            );
          })}
          
          {/* Make spacer smaller to ensure last card is not fully centered */}
          <div className="flex-shrink-0" style={{ width: 'calc(50vw - 110px)' }}></div>
        </div>
        
        {/* Hide scrollbar for WebKit browsers */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default FloatingPropertyCards;
