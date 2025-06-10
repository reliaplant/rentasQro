'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { condoAmenities } from '@/app/constants/amenities';
import GaleriaPropiedad from '@/app/propiedad/[id]/components/galeriaPropiedad';

// Priority order of amenities (most important to least important)
const amenityPriorityOrder = [
  'pool',         // 🏊‍♂️ Alberca
  'gym',          // 💪 Gimnasio
  'security',     // 👮 Vigilancia
  'eventRoom',    // 🎉 Salón de eventos
  'grill',        // 🔥 Área de asadores
  'playground',   // 🎡 Parque infantil
  'greenAreas',   // 🌳 Áreas verdes
  'general',      // 🏠 Área general
  'padelCourt',   // 🎾 Cancha de pádel
  'basketballCourt', // 🏀 Cancha de basket
  'businessCenter', // 💼 Business Center
  'playRoom',     // 🏓 Ludoteca
  'sauna',        // ♨️ Sauna
  'firePit',      // 🔥 Fogatero
  'yogaArea',     // 🧘 Zona de yoga
  'wineCellar'    // 🍷 Cavas
];

interface GalleryProps {
  name: string;
  imageUrls?: string[];
  amenities?: string[] | Record<string, string>;
  imageAmenityTags?: Record<string, string> | Record<string, string[]>;
}

export default function Gallery({ name, imageUrls, amenities, imageAmenityTags }: GalleryProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  // Log the available amenity tags for debugging
  useEffect(() => {
    if (imageAmenityTags) {
      console.log('Image tags format check:', {
        isIndexBased: Object.keys(imageAmenityTags).some(key => !isNaN(parseInt(key))),
        tagKeys: Object.keys(imageAmenityTags).slice(0, 3), // Just show first 3 keys to avoid clutter
      });
    }
  }, [imageAmenityTags]);

  // Enhanced debugging for amenity tags - add this to see what's happening
  useEffect(() => {
    if (!imageAmenityTags) return;
    
    // Log all the amenity tags for inspection
    console.log('All image amenity tags:', imageAmenityTags);
    
    // Check if all amenity IDs are valid
    const validAmenityIds = condoAmenities.map(a => a.id);
    const tagValues = Object.values(imageAmenityTags).flat();
    const invalidTags = tagValues.filter(tag => 
      !validAmenityIds.includes(Array.isArray(tag) ? tag[0] : tag)
    );
    
    if (invalidTags.length > 0) {
      console.warn('Found invalid amenity tags:', invalidTags);
      console.warn('Valid amenity IDs are:', validAmenityIds);
    }
  }, [imageAmenityTags]);

  // Add this debugging function to inspect ALL data structures
  useEffect(() => {
    console.log('🔍 DEBUGGING GALLERY COMPONENT:');
    console.log('- condoAmenities available:', condoAmenities.map(a => ({ id: a.id, label: a.label })));
    console.log('- imageAmenityTags structure:', imageAmenityTags);
    
    // Check if there's any mismatch that could cause wrong categories
    if (imageAmenityTags) {
      const tagValues = Object.entries(imageAmenityTags).map(([key, value]) => ({
        key,
        value: Array.isArray(value) ? value[0] : value
      }));
      
      // Find any tags that don't match valid amenity IDs
      const matchingAmenities = tagValues.map(tag => {
        const matchedAmenity = condoAmenities.find(a => 
          a.id.toLowerCase() === (tag.value || '').toLowerCase()
        );
        return {
          key: tag.key,
          tagValue: tag.value,
          matched: !!matchedAmenity,
          matchedTo: matchedAmenity ? matchedAmenity.id : 'none'
        };
      });
      
      const mismatches = matchingAmenities.filter(item => !item.matched);
      if (mismatches.length > 0) {
        console.warn('⚠️ TAG MISMATCHES:', mismatches);
        console.warn('This could be causing unexpected categories!');
      }
    }
  }, [imageAmenityTags]);

  // Modified function to use "general" for all untagged images
  const getAmenityIdForImage = (img: string, index: number): string | undefined => {
    // Priority 1: Check for index-based tags (new format)
    if (imageAmenityTags) {
      const indexKey = index.toString();
      if (indexKey in imageAmenityTags) {
        const tagValue = imageAmenityTags[indexKey];
        const amenityId = Array.isArray(tagValue) ? tagValue[0] : tagValue;
        
        // Case insensitive match against valid amenities
        const matchedAmenity = condoAmenities.find(a => 
          a.id.toLowerCase() === (amenityId || '').toLowerCase()
        );
        
        if (matchedAmenity) {
          // Use the CORRECT casing from the constants, not from the data
          return matchedAmenity.id;
        } else {
          console.warn(`Image at index ${index} has invalid/unknown amenity ID: "${amenityId}"`);
        }
      }
    }
    
    // Default to "general" for all untagged images
    return "general";
  };

  // Filter out broken images - moved up before it's used
  const validImageUrls = imageUrls?.filter(url => !brokenImages.has(url));

  // For debugging - log what tags we found
  useEffect(() => {
    if (!validImageUrls) return;
    
    console.log("Image Tags Found:", validImageUrls.map((img, i) => ({
      index: i,
      amenityId: getAmenityIdForImage(img, i)
    })));
  }, [validImageUrls, imageAmenityTags]);

  // Modified grouping logic to use the "general" amenity for untagged images
  const groupedImages = useMemo(() => {
    if (!validImageUrls) return {};
    
    // Find the "General" label from condoAmenities
    const generalAmenity = condoAmenities.find(a => a.id === 'general');
    const generalLabel = generalAmenity ? generalAmenity.label : 'General';
    
    const result = validImageUrls.reduce((acc, img, index) => {
      // Get amenity details for this image
      const amenityId = getAmenityIdForImage(img, index);
      const amenity = condoAmenities.find(a => a.id === amenityId);
      
      // Use the amenity label or fallback to the General label
      const category = amenity?.label || generalLabel;
      
      if (!acc[category]) {
        acc[category] = [];
      }
      
      acc[category].push({ img, index, amenityId });
      
      return acc;
    }, {} as Record<string, { img: string; index: number; amenityId?: string }[]>);
    
    // Log the final groupings with their amenity IDs for debugging
    console.log('Grouped images by category:', 
      Object.entries(result).map(([category, images]) => ({
        category,
        count: images.length,
        amenityIds: images.map(img => img.amenityId).filter(Boolean)
      }))
    );
    
    return result;
  }, [validImageUrls, imageAmenityTags]);

  // Log the grouping results for debugging
  console.log('Image grouping results:', 
    Object.keys(groupedImages || {}).map(category => ({
      category,
      count: groupedImages?.[category]?.length || 0
    }))
  );

  // Function to sort categories by amenity priority
  const sortCategoriesByPriority = (a: string, b: string) => {
    const getAmenityIdFromCategory = (category: string) => {
      const foundAmenity = condoAmenities.find(amenity => amenity.label === category);
      return foundAmenity?.id || 'general';
    };

    const aId = getAmenityIdFromCategory(a);
    const bId = getAmenityIdFromCategory(b);

    const aPosition = amenityPriorityOrder.indexOf(aId);
    const bPosition = amenityPriorityOrder.indexOf(bId);

    const aPriority = aPosition === -1 ? 999 : aPosition;
    const bPriority = bPosition === -1 ? 999 : bPosition;

    return aPriority - bPriority;
  };

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
            setBrokenImages(prev => {
              const updated = new Set(prev);
              updated.add(img);
              return updated;
            });
          }}
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
    <div className="mt-8 md:mt-12 mb-8 md:mb-12 border-t pt-6 border-gray-200">
      <div className="flex items-center justify-between mb-4 md:mb-6">
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

      <div className="space-y-4 md:space-y-6">
        {Object.keys(groupedImages).length > 0 ? (
          Object.entries(groupedImages)
            .sort(([catA, _], [catB, __]) => sortCategoriesByPriority(catA, catB))
            .map(([category, images]) => (
              <div key={category} className="flex flex-col md:flex-row gap-2">
                {/* Category Label with count - no special styling for general/uncategorized */}
                <div className="w-full md:w-96 md:flex-shrink-0">
                  <div className="rounded-lg p-3 bg-white">
                    <h4 className="font-medium text-lg md:text-xl text-gray-900">
                      {category}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {images.length} {images.length === 1 ? 'foto' : 'fotos'}
                    </p>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="flex-grow mt-2 md:mt-0">
                  {renderPhotoGrid(images)}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-10 text-gray-500">
            {validImageUrls && validImageUrls.length > 0 ? (
              <div>
                <p>No se pudieron categorizar las imágenes correctamente</p>
                <p className="text-sm mt-2">Etiquetas disponibles: {JSON.stringify(imageAmenityTags ? Object.keys(imageAmenityTags).length : 0)}</p>
              </div>
            ) : (
              'No hay imágenes disponibles'
            )}
          </div>
        )}
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
