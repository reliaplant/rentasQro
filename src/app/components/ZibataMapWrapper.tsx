'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Dynamic import on the client side
const ZibataMap = dynamic(() => import('@/app/components/ZibataMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="animate-pulse">Cargando mapa interactivo...</div>
    </div>
  ),
});

interface ZibataMapWrapperProps {
  highlightedPolygonId?: string;
  className?: string;
  height?: string;
}

export default function ZibataMapWrapper(props: ZibataMapWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Intersection Observer para carga perezosa
  useEffect(() => {
    if (!mapRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: '200px', // Precarga cuando está a 200px de entrar en la pantalla
        threshold: 0.1,
      }
    );

    observer.observe(mapRef.current);
    return () => {
      if (mapRef.current) observer.unobserve(mapRef.current);
    };
  }, []);

  // Only render the map client-side after component mount and when in view
  useEffect(() => {
    if (isInView) {
      // Añadir un pequeño retraso para asegurar que la UI responda bien
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Simular la carga completa después de 600ms para mejorar la experiencia del usuario
  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        setMapLoaded(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  // Handle polygon click inside the client component
  const handlePolygonClick = (polygonId: string) => {
    console.log("Clicked on polygon:", polygonId);
    
    // We can navigate or do other client-side actions here
    // For example:
    // const polygon = getPolygonData(polygonId);
    // if (polygon?.slug) {
    //   router.push(`/qro/zibata/${polygon.slug}`);
    // }
  };

  return (
    <div 
      ref={mapRef}
      className={`${props.className || ''} relative transition-opacity duration-500 ${mapLoaded ? 'opacity-100' : 'opacity-90'}`}
      style={{ height: props.height || '100%' }}
    >
      {/* Imagen estática de placeholder para optimizar la percepción de carga */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-50">
          <Image
            src="/assets/zibata/mapaZibataFondo.svg"
            alt="Mapa de Zibatá"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain opacity-70"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 px-3 py-1.5 rounded-full text-sm shadow-sm">
              Cargando mapa interactivo...
            </div>
          </div>
        </div>
      )}

      {/* Cargar el mapa interactivo solo cuando esté en el viewport */}
      {isMounted && (
        <ZibataMap 
          {...props} 
          onPolygonClick={handlePolygonClick}
        />
      )}
    </div>
  );
}
