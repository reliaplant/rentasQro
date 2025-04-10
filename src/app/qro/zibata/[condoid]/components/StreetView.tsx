'use client';

import Image from 'next/image';
import { ArrowUpRight, MapPin } from 'lucide-react';

interface StreetViewProps {
  streetViewImage?: string;
  streetViewLink?: string;
  name: string;
}

export default function StreetView({ streetViewImage, streetViewLink, name }: StreetViewProps) {
  const handleClick = () => {
    if (streetViewLink) {
      window.open(streetViewLink, '_blank');
    }
  };

  return (
    <div className="mt-8 md:mt-16 h-[30vh] sm:h-[35vh] md:h-[35vh] px-4 md:px-0">
      <div className="space-y-2 md:space-y-4 flex flex-col h-full">
        <h3 className="text-base md:text-lg font-semibold">Vista de calle</h3>
        <div className="aspect-[16/10] md:aspect-video relative rounded-lg md:rounded-xl overflow-hidden flex-grow cursor-pointer group">
          {streetViewImage ? (
            <>
              <Image
                src={streetViewImage}
                alt={`Vista de calle de ${name}`}
                fill
                className="object-cover transition-all group-hover:brightness-75"
                onClick={handleClick}
              />
              <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleClick}
              >
                <span className="text-white flex items-center gap-1 md:gap-2 bg-black/50 px-2 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm">
                  Ver en Google Street View
                  <ArrowUpRight size={14} className="md:w-4 md:h-4" />
                </span>
              </div>
              <button
                className="absolute top-1.5 md:top-2 right-1.5 md:right-2 p-1 md:p-1.5 rounded-full border border-gray-300 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:bg-gray-50 hover:scale-125 hover:cursor-pointer transition-transform"
                onClick={handleClick}
              >
                <ArrowUpRight size={12} className="md:w-4 md:h-4" />
              </button>
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No hay vista de calle disponible</span>
            </div>
          )}
        </div>
        <div className="mt-auto">
          {streetViewLink && (
            <a
              href={streetViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-2xs md:text-sm text-gray-600 hover:text-violet-600"
            >
              <MapPin size={12} className="mr-1 md:w-3.5 md:h-3.5" />
              Ver en Google Street View
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
