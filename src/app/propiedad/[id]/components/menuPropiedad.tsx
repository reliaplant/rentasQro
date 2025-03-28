"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronRight, MapPin, Home, Building } from 'lucide-react';
import { PropertyData, ZoneData, CondoData } from '@/app/shared/interfaces';

interface MenuPropiedadProps {
  property: PropertyData;
  zoneData?: ZoneData | null;
  condoData?: CondoData | null;
}

// Simpler version with CSS transitions only
export default function MenuPropiedad({ property, zoneData, condoData }: MenuPropiedadProps) {
  const [activeSection, setActiveSection] = useState('info');
  const [showMenu, setShowMenu] = useState(false);
  const observerRefs = useRef<IntersectionObserver[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Section references
  const infoRef = useRef<HTMLDivElement | null>(null);
  const characteristicsRef = useRef<HTMLDivElement | null>(null);
  const amenitiesRef = useRef<HTMLDivElement | null>(null);
  const equipmentRef = useRef<HTMLDivElement | null>(null);
  const condoRef = useRef<HTMLDivElement | null>(null);
  const zibataRef = useRef<HTMLDivElement | null>(null);

  // Property type display name
  const propertyTypeName = 
    property.propertyType === 'casa' ? 'Casa' : 
    property.propertyType === 'departamento' ? 'Departamento' :
    property.propertyType === 'depa' ? 'Departamento' : 
    property.propertyType;

  useEffect(() => {
    // Watch for scroll position to determine when to show menu
    const handleScroll = () => {
      const photoSection = document.querySelector('.property-photos') as HTMLElement;
      if (!photoSection) return;
      
      const photoBottom = photoSection.getBoundingClientRect().bottom;
      // Show menu when photos are above viewport
      setShowMenu(photoBottom <= 0);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    // Cleanup previous observers
    observerRefs.current.forEach(observer => observer.disconnect());
    observerRefs.current = [];
    
    // Options for the observer
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2,
    };

    // Setup observers for each section
    const sections = [
      { id: 'info', ref: infoRef },
      { id: 'characteristics', ref: characteristicsRef },
      { id: 'amenities', ref: amenitiesRef },
      { id: 'equipment', ref: equipmentRef }
    ];

    if (condoData) {
      sections.push({ id: 'condo', ref: condoRef });
    }
    
    if (property.zone === 'zibata') {
      sections.push({ id: 'zibata', ref: zibataRef });
    }

    sections.forEach(section => {
      if (section.ref.current) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setActiveSection(section.id);
            }
          });
        }, options);
        
        observer.observe(section.ref.current);
        observerRefs.current.push(observer);
      }
    });

    return () => {
      observerRefs.current.forEach(observer => observer.disconnect());
    };
  }, [property.zone, condoData]);

  const scrollToSection = (sectionId: string) => {
    
  };

  return (
    <div 
      ref={menuRef}
      className="sticky top-0 z-40 overflow-hidden transition-all duration-300 ease-in-out shadow-sm"
      style={{ height: showMenu ? '56px' : '0px' }}
    >
      <div 
        className="bg-white border-b border-gray-200 shadow-sm w-full transition-transform duration-300 ease-in-out"
        style={{ transform: showMenu ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-14 overflow-x-auto no-scrollbar">
            <div className="flex items-center text-sm text-gray-700 whitespace-nowrap">
              <Home className="w-4 h-4 mr-1" />
              <span className="font-medium">{propertyTypeName}</span>
              
              {condoData && (
                <>
                  <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                  <button 
                    onClick={() => scrollToSection('condo')}
                    className={`flex items-center ${activeSection === 'condo' ? 'text-blue-600 font-medium' : ''}`}
                  >
                    <Building className="w-4 h-4 mr-1" />
                    <span>{condoData.name}</span>
                  </button>
                </>
              )}
              
              {zoneData && (
                <>
                  <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                  <button 
                    onClick={() => scrollToSection(property.zone === 'zibata' ? 'zibata' : 'info')}
                    className={`flex items-center ${activeSection === 'zibata' ? 'text-blue-600 font-medium' : ''}`}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{zoneData.name}</span>
                  </button>
                </>
              )}
            </div>
            
            <div className="ml-auto flex space-x-6">
              <button 
                onClick={() => scrollToSection('info')}
                className={`text-sm ${activeSection === 'info' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                General
              </button>
              <button 
                onClick={() => scrollToSection('characteristics')}
                className={`text-sm ${activeSection === 'characteristics' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Características
              </button>
              <button 
                onClick={() => scrollToSection('amenities')}
                className={`text-sm ${activeSection === 'amenities' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Comodidades
              </button>
              <button 
                onClick={() => scrollToSection('equipment')}
                className={`text-sm ${activeSection === 'equipment' ? 'text-blue-600 font-medium' : 'text-gray-600'}`}
              >
                Equipamiento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}