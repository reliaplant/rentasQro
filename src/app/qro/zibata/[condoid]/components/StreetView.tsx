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
    <div className="mt-16 h-[35vh] md:px-0 px-6">
      <div className="space-y-4 flex flex-col h-full">
        <h3 className="text-lg font-semibold">Vista de calle</h3>
        <div className="aspect-video relative rounded-xl overflow-hidden flex-grow cursor-pointer group">
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
                <span className="text-white flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                  Ver en Google Street View
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <button
                className="absolute top-2 right-2 p-1.5 rounded-full border border-gray-300 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:bg-gray-50 hover:scale-125 hover:cursor-pointer transition-transform"
                onClick={handleClick}
              >
                <ArrowUpRight size={16} />
              </button>
            </>
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No hay vista de calle disponible</span>
            </div>
          )}
        </div>
        <div className="mt-auto">
          {streetViewLink && (
            <a
              href={streetViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs md:text-sm text-gray-600 hover:text-violet-600"
            >
              <MapPin size={14} className="mr-1" />
              Ver en Google Street View
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
