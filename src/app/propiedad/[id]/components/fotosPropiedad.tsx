import { useState } from 'react';
import Image from 'next/image';
import GaleriaPropiedad from './galeriaPropiedad';

interface FotosPropiedadProps {
  images: string[];
  propertyType?: string;
}

export default function FotosPropiedad({ images, propertyType }: FotosPropiedadProps) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // If no images, don't render anything
  if (!images?.length) return null;

  return (
    <>
      <section className="relative">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[50vh] relative rounded-2xl overflow-hidden">
            {/* Main large image */}
            <div 
                className="col-span-2 row-span-2 relative cursor-pointer"
                onClick={() => setShowAllPhotos(true)}
            >
                <Image
                    src={images[0]}
                    alt="Principal"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors z-50 shadow-lg " />
            </div>
            
            {/* Side images grid */}
            <div className="grid grid-cols-2 col-span-2 row-span-2 gap-2 ">
                {images.slice(1, 5).map((url, i) => (
                    <div 
                        key={i} 
                        className="relative cursor-pointer overflow-hidden"
                        onClick={() => setShowAllPhotos(true)}
                    >
                        <Image
                            src={url}
                            alt={`Foto ${i + 2}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover "
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors" />
                    </div>
                ))}
            </div>

            {/* Show all photos button */}
            <button
              onClick={() => setShowAllPhotos(true)}
              className="cursor-pointer text-sm absolute bottom-0 right-0 bg-black/80 backdrop-blur-sm rounded-tl-lg rounded-br-lg px-6 py-3 font-semibold text-white border-black border-1  
               shadow-lg z-10"
            >
              Mostrar todas las {images.length} fotos
            </button>
        </div>
      </section>

      <GaleriaPropiedad
        isOpen={showAllPhotos}
        onClose={() => setShowAllPhotos(false)}
        images={images}
        propertyType={propertyType}
      />
    </>
  );
}