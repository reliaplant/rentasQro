'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { condoAmenities } from '@/app/constants/amenities';
import GaleriaPropiedad from '@/app/propiedad/[id]/components/galeriaPropiedad';

interface GalleryProps {
  name: string;
  imageUrls?: string[];
  amenities?: string[] | Record<string, string>; // Update to accept both array and object formats
  imageAmenityTags?: Record<string, string> | Record<string, string[]>; // Allow both string and string[] values
}

export default function Gallery({ name, imageUrls, amenities, imageAmenityTags }: GalleryProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // Log what we received to help debug
  console.log('Gallery component received:', { 
    imageUrlsCount: imageUrls?.length,
    amenitiesFormat: amenities ? (Array.isArray(amenities) ? 'array' : 'object') : 'undefined',
    imageAmenityTagsExists: !!imageAmenityTags
  });

  // A more robust function to get the amenity ID for an image
  const getAmenityIdForImage = (img: string, index: number) => {
    // If we have imageAmenityTags (from editCondo), use that
    if (imageAmenityTags) {
      // Try direct match first
      if (imageAmenityTags[img]) {
        const tagValue = imageAmenityTags[img];
        // Handle both string and string[] types
        const amenityId = Array.isArray(tagValue) ? tagValue[0] : tagValue;
        console.log('Direct match found in imageAmenityTags');
        return amenityId;
      }
      
      // Firebase URLs contain the filename but with encoding - try to extract and match
      if (img.includes('firebasestorage.googleapis.com')) {
        const imgFilename = img.split('%2F').pop()?.split('?')[0];
        
        // Look through all keys in imageAmenityTags
        for (const [tagUrl, amenityId] of Object.entries(imageAmenityTags)) {
          // For Firebase URLs, check if any saved key includes the filename
          if (imgFilename && tagUrl.includes(imgFilename)) {
            console.log(`Matched Firebase URL by filename: ${imgFilename}`);
            return amenityId;
          }
          
          // For blob URLs that have been replaced with Firebase URLs
          // Extract the filename from both and compare
          if (tagUrl.startsWith('blob:')) {
            const tagFilename = tagUrl.split('/').pop();
            const storedFilename = img.split('%2F').pop()?.split('?')[0];
            
            // Check for any image index pattern like number at end of filename
            const tagNumber = tagFilename?.match(/\d+/)?.[0];
            const storedNumber = storedFilename?.match(/\d+/)?.[0];
            
            if (tagNumber && storedNumber && tagNumber === storedNumber) {
              console.log(`Matched blob URL to Firebase URL by number pattern: ${tagNumber}`);
              return amenityId;
            }
          }
        }
      }
    }
    
    // If amenities is an array, use the corresponding index
    if (amenities && Array.isArray(amenities) && amenities[index]) {
      console.log('Using amenities array match');
      return amenities[index];
    }
    
    // If amenities is an object (like imageAmenityTags), try to find a match
    if (amenities && typeof amenities === 'object' && !Array.isArray(amenities)) {
      // Try exact match
      if ((amenities as Record<string, string>)[img]) {
        console.log('Exact match in amenities object');
        return (amenities as Record<string, string>)[img];
      }
      
      // Extract filename or key parts for matching
      const filename = img.split('/').pop()?.split('?')[0] || '';
      for (const [key, value] of Object.entries(amenities as Record<string, string>)) {
        // Try matching by filename
        const keyFilename = key.split('/').pop()?.split('?')[0] || '';
        if (filename && keyFilename && (filename.includes(keyFilename) || keyFilename.includes(filename))) {
          console.log(`Matched by filename parts: ${filename} - ${keyFilename}`);
          return value;
        }
      }
    }
    
    // Default to null (which will be categorized as "General")
    console.log('No match found, defaulting to General');
    return null;
  };

  // Filter out broken images before grouping
  const validImageUrls = imageUrls?.filter(url => !brokenImages.has(url));

  // Group images by amenity with our more robust method
  const groupedImages = validImageUrls?.reduce((acc, img, index) => {
    const amenityId = getAmenityIdForImage(img, index);
    
    // Log for debugging
    console.log(`Processing image ${index}:`, {
      img: img?.substring(0, 50), // Truncate for readability
      amenityId,
      source: imageAmenityTags?.[img] ? 'imageAmenityTags' : 
              (Array.isArray(amenities) && amenities[index]) ? 'amenities array' : 
              'fallback',
      matchedAmenity: condoAmenities.find(a => a.id === amenityId)?.label
    });
    
    const amenity = amenityId ? condoAmenities.find(a => a.id === amenityId) : null;
    const category = amenity?.label || 'General';
    
    if (!acc[category]) acc[category] = [];
    acc[category].push({ img, index });
    return acc;
  }, {} as Record<string, { img: string; index: number }[]>);

  // Debug the final grouping result
  console.log('Grouped by category:', Object.keys(groupedImages || {}));

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
          onError={() => {
            console.log(`Image failed to load: ${img}`);
            setBrokenImages(prev => {
              const updated = new Set(prev);
              updated.add(img);
              return updated;
            });
          }}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
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
    <div className="mt-8 md:mt-12 mb-8 md:mb-12 px-4 md:px-6 -mx-4 md:mx-0 border-t pt-6 border-gray-200">
      <div className="flex items-center justify-between mb-4 md:mb-6 px-4 md:px-0">
        <h3 className="text-base md:text-lg font-semibold">Galería de {name}</h3>
        {validImageUrls && validImageUrls.length > 1 && (
          <button 
            onClick={() => {
              setInitialIndex(0);
              setIsGalleryOpen(true);
            }}
            className="text-xs md:text-sm text-gray-400 hover:text-gray-800 cursor-pointer transition-colors flex items-center gap-1"
          >
            Ver todas ({validImageUrls.length})
            <ArrowUpRight size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4 md:space-y-2">
        {groupedImages && Object.entries(groupedImages).map(([category, images]) => (
          <div key={category} className="flex flex-col md:flex-row gap-2">
            {/* Category Label - Mobile optimized */}
            <div className="w-full md:w-64 md:flex-shrink-0 px-4 md:px-0">
              <div className="bg-white p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-lg md:text-xl text-gray-900">{category}</h4>
                <p className="text-xs md:text-sm text-gray-500 mt-1">{images.length} fotos</p>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="flex-grow px-4 md:px-0 mt-2 md:mt-0">
              {renderPhotoGrid(images)}
            </div>
          </div>
        ))}
      </div>

      <GaleriaPropiedad
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={validImageUrls || []}
        initialIndex={initialIndex}
      />
    </div>
  );
}
