'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { condoAmenities } from '@/app/constants/amenities';
import GaleriaPropiedad from '@/app/propiedad/[id]/components/galeriaPropiedad';

interface GalleryProps {
  name: string;
  imageUrls?: string[];
  amenities?: string[];
}

export default function Gallery({ name, imageUrls, amenities }: GalleryProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  // Agrupar imágenes por amenidad
  const groupedImages = imageUrls?.reduce((acc, img, index) => {
    const amenityId = amenities?.[index];
    const amenity = amenityId ? condoAmenities.find(a => a.id === amenityId) : null;
    const category = amenity?.label || 'General';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push({ img, index });
    return acc;
  }, {} as Record<string, { img: string; index: number }[]>);

  const ImageItem = ({ img, index, isWide = false }: { img: string; index: number; isWide?: boolean }) => (
    <div 
      className={`relative cursor-pointer group ${isWide ? 'col-span-2' : ''}`}
      onClick={() => {
        setInitialIndex(index);
        setIsGalleryOpen(true);
      }}
    >
      <div className={`relative rounded-lg overflow-hidden ${isWide ? 'aspect-[2/1]' : 'aspect-[3/2]'}`}>
        <Image
          src={img}
          alt={`${name} vista ${index + 1}`}
          fill
          className="object-cover transition-all duration-200 group-hover:brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-1.5 shadow-lg">
            <ArrowUpRight className="h-4 w-4 text-gray-700" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhotoGrid = (images: { img: string; index: number }[]) => {
    const totalImages = images.length;

    switch (totalImages) {
      case 1:
        return (
          <div className="w-full">
            <ImageItem img={images[0].img} index={images[0].index} isWide={true} />
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-2 gap-2">
            {images.map(({ img, index }) => (
              <ImageItem key={index} img={img} index={index} />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <ImageItem img={images[0].img} index={images[0].index} isWide={true} />
            </div>
            {images.slice(1).map(({ img, index }) => (
              <ImageItem key={index} img={img} index={index} />
            ))}
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-2 gap-2">
            <ImageItem img={images[0].img} index={images[0].index} isWide={true} />
            {images.slice(1, 3).map(({ img, index }) => (
              <ImageItem key={index} img={img} index={index} />
            ))}
            <ImageItem img={images[3].img} index={images[3].index} isWide={true} />
          </div>
        );
      default: // 5 o más imágenes
        return (
          <div className="grid grid-cols-2 gap-2">
            <ImageItem img={images[0].img} index={images[0].index} isWide={true} />
            {images.slice(1, 3).map(({ img, index }) => (
              <ImageItem key={index} img={img} index={index} />
            ))}
            <ImageItem img={images[3].img} index={images[3].index} isWide={true} />
            {images.slice(4, 6).map(({ img, index }) => (
              <ImageItem key={index} img={img} index={index} />
            ))}
            {/* Mostrar botón "ver más" si hay más de 6 imágenes */}
            {images.length > 6 && (
              <div 
                className="relative cursor-pointer group col-span-2"
                onClick={() => {
                  setInitialIndex(6);
                  setIsGalleryOpen(true);
                }}
              >
                <div className="aspect-[2/1] relative rounded-lg overflow-hidden bg-gray-900">
                  <Image
                    src={images[6].img}
                    alt={`${name} vista adicional`}
                    fill
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      +{images.length - 6} más
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="mt-12 mb-12 px-6 md:px-0 border-t pt-6 border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Galería de {name}</h3>
        {imageUrls && imageUrls.length > 1 && (
          <button 
            onClick={() => {
              setInitialIndex(0);
              setIsGalleryOpen(true);
            }}
            className="text-sm text-gray-400 hover:text-gray-800 cursor-pointer transition-colors flex items-center gap-1"
          >
            Ver todas ({imageUrls.length})
            <ArrowUpRight size={16} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {groupedImages && Object.entries(groupedImages).map(([category, images]) => (
          <div key={category} className="flex gap-2">
            {/* Category Label - Simplified */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white p-4 rounded-lg ">
                <h4 className="font-medium text-xl text-gray-900">{category}</h4>
                <p className="text-sm text-gray-500 mt-1">{images.length} fotos</p>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="flex-grow">
              {renderPhotoGrid(images)}
            </div>
          </div>
        ))}
      </div>

      <GaleriaPropiedad
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={imageUrls || []}
        initialIndex={initialIndex}
      />
    </div>
  );
}
