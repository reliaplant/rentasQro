import Image from 'next/image';
import { Star, MapPin, Shield, X, CheckCircle, WashingMachine, ArrowUpRight, ArrowUpRightIcon } from 'lucide-react';
import { CondoData } from '@/app/shared/interfaces';
import { condoAmenities, sortAmenitiesByPriority, getOrderedAmenities } from '@/app/constants/amenities';
// import Reviews from './reviews';
import { 
  CheckmarkFilled, CloseFilled, Misuse, WordCloud, Education, Building, 
  Sprout, Tree, Box, Temperature, Fire, Restaurant, Basketball
} from '@carbon/icons-react';
import { PiXFill } from 'react-icons/pi';
import GaleriaPropiedad from './galeriaPropiedad';
import { useState } from 'react';

interface CondoSectionProps {
  condoData: CondoData | null;
}

// Simplified function to get the amenity icon directly from the constants
const getAmenityIcon = (amenityId: string) => {
  // Find the amenity in the constants
  const amenity = condoAmenities.find(a => a.id === amenityId);
  if (!amenity) return null;

  // Return the icon directly from the constant
  return (
    <span className="text-gray-600">{amenity.icon}</span>
  );
};

export default function CondoSection({ condoData }: CondoSectionProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  if (!condoData) return null;

  // Get ordered amenities for the gallery
  const organizedImages = () => {
    

    return condoData.imageUrls || [];
    // if (!condoData.imageUrls || condoData.imageUrls.length === 0) {
    //   return [];
    // }

    // if (!condoData.amenities || condoData.amenities.length === 0) {
    //   return condoData.imageUrls;
    // }

    // // Get amenities sorted by priority
    // const sortedAmenities = sortAmenitiesByPriority(condoData.amenities);
    
    // // Map of images to their amenities (if available)
    // const imageAmenityMap: Record<string, string> = {};
    
    // if (condoData.imageAmenityTags) {
    //   // Map all explicitly tagged images
    //   for (const [imgUrl, amenityId] of Object.entries(condoData.imageAmenityTags)) {
    //     const amenityIdString = Array.isArray(amenityId) ? amenityId[0] : amenityId;
    //     imageAmenityMap[imgUrl] = amenityIdString;
    //   }
    // }
    
    // // Create an ordered list of images based on amenity priority
    // const orderedImages: string[] = [];
    
    // // Add explicitly tagged images in priority order
    // sortedAmenities.forEach(amenityId => {
    //   const matchingImages = Object.entries(imageAmenityMap)
    //     .filter(([_, tagAmenityId]) => tagAmenityId === amenityId)
    //     .map(([imgUrl]) => imgUrl);
      
    //   orderedImages.push(...matchingImages);
    // });
    
    // // Add remaining images that don't have explicit tags
    // const untaggedImages = condoData.imageUrls.filter(img => !imageAmenityMap[img]);
    // orderedImages.push(...untaggedImages);
    
    // // Ensure we're not duplicating images and maintain original ones if we're missing any
    // const uniqueOrderedImages = [...new Set(orderedImages)];
    // const missingImages = condoData.imageUrls.filter(img => !uniqueOrderedImages.includes(img));
    
    // return [...uniqueOrderedImages, ...missingImages];
  };

  // Simplified function to get amenity for an image
  const getImageAmenity = (img: string, index: number) => {
    if (!condoData.imageAmenityTags) return null;

    // The tags are stored with the index as key
    const indexKey = index.toString();
    if (indexKey in condoData.imageAmenityTags) {
      const amenityId = condoData.imageAmenityTags[indexKey];
      // Handle both string and array cases
      const amenityIdString = Array.isArray(amenityId) ? amenityId[0] : amenityId;
      return condoAmenities.find(a => a.id === amenityIdString);
    }
    
    return null;
  };
  
  // Helper function to get a default amenity based on priority
  const getDefaultAmenity = (index: number) => {
    if (!condoData.amenities || condoData.amenities.length === 0) {
      return null;
    }
    
    const sortedAmenities = sortAmenitiesByPriority(condoData.amenities);
    const amenityId = sortedAmenities[index % sortedAmenities.length];
    return condoAmenities.find(a => a.id === amenityId);
  };

  // Get the organized images
  const images = organizedImages();

  return (
    <div className="max-w-7xl">
      {/* Modern Header with Logo & Title */}
      <div className="overflow-hidden mb-12">
        {/* Hero Banner */}

        {/* Content Area */}
        <div className="flex gap-6 border rounded-2xl border-gray-200 flex flex-row items-center p-0 md:p-4 bg-gradient-to-r from-violet-50 to-gray-50 p-4 shadow-[0_8px_20px_rgb(0,0,0,0.05)]">

          <div className=''>
            {condoData.logoUrl ? (
              <Image
                src={condoData.logoUrl}
                alt={`${condoData.name} logo`}
                width={90}
                height={45}
                className="object-contain border border-black rounded"
              />
            ) : (
              <div className="h-12 flex items-center">
                <h3 className="text-xl font-bold text-gray-800">{condoData.name}</h3>
              </div>
            )}
          </div>
          <div className='flex justify-between w-full'>

            <div className="flex justify-between items-start">
              {/* Left: Title and Type */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold ">{condoData.name}</h2>

                  <div className='flex items-center gap-2'>
                    {condoData.googleRating && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">{condoData.googleRating}</span>
                        <span className="text-xs text-gray-500">({condoData.totalRatings})</span>
                      </div>
                    )}
                    {condoData.googlePlaceId && (
                      <a
                        href={`https://www.google.com/maps/place/?q=place_id:${condoData.googlePlaceId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-gray-50 flex items-center gap-1 hidden md:flex"
                      >
                        - Según reseñas de Google
                        <MapPin size={14} />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  Ubicado en este exclusivo condominio
                </p>
              </div>


            </div>
            {/* Right: Action Buttons */}
            <div className="flex gap-2 h-fit">

            </div>
          </div>

        </div>
      </div>

      {/* Description Section */}
      <div className="mb-8 pb-8 border-b border-gray-100">
        <p className="text-black max-w-xl font-bold text-lg ">
          {condoData.shortDescription}
        </p>
        <br />
        <p className="text-gray-700 whitespace-pre-line text-base md:text-base text-sm">{condoData.description}</p>
      </div>
      
      {/* Amenities Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 ">Amenidades de este lugar</h3>

        <div className="grid grid-cols-2 gap-2">
          {/* Included Amenities - Now using sorted amenities */}
          <div className="rounded-xl p-4 bg-gray-50">
            <h4 className="text-base font-bold mb-3 text-black flex items-center gap-2">
              <CheckmarkFilled size={16} className="text-green-600" />
              Incluye
            </h4>
            <div className="space-y-2">
              {condoData.amenities && sortAmenitiesByPriority(condoData.amenities).map((amenityId) => {
                const amenityDetails = condoAmenities.find(a => a.id === amenityId);
                if (!amenityDetails) return null;

                return (
                  <div key={amenityId} className="flex items-center gap-2">
                    <div className="">
                      {getAmenityIcon(amenityId)}
                    </div>
                    <span className="text-sm md:text-sm text-xs text-gray-700 font-medium">
                      {amenityDetails.label}
                    </span>
                  </div>
                );
              })}

              {(!condoData.amenities || condoData.amenities.length === 0) && (
                <p className="text-xs text-gray-500 italic">No hay amenidades registradas</p>
              )}
            </div>
          </div>

          {/* Not Included Amenities - Sort these by priority too */}
          <div className="bg-gray-50 rounded-xl p-4 ">
            <h4 className="font-bold mb-3  flex items-center gap-2">
              <Misuse size={16} className="text-red-700" />
              No incluye
            </h4>

            <div className="space-y-2">
              {condoAmenities
                .filter(amenity => !condoData.amenities?.includes(amenity.id))
                .sort((a, b) => a.priority - b.priority)
                .map((amenityDetails) => (
                  <div key={amenityDetails.id} className="flex items-center gap-2">
                    <div className="">
                      {getAmenityIcon(amenityDetails.id)}
                    </div>
                    <span className="text-sm md:text-sm text-xs text-gray-700 font-medium">
                      {amenityDetails.label}
                    </span>
                  </div>
                ))}

              {condoAmenities.length === (condoData.amenities || []).length && (
                <p className="text-xs text-gray-500 italic">Todas las amenidades están incluidas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Photo Grid */}
      <div className="mt-12 mb-12 md:px-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Galería de {condoData.name}</h3>
          {condoData.imageUrls && condoData.imageUrls.length > 4 && (
            <button 
              onClick={() => {
                setInitialIndex(0);
                setIsGalleryOpen(true);
              }}
              className="text-sm text-gray-400 hover:text-gray-800 cursor-pointer transition-colors flex items-center gap-1"
            >
              {condoData.imageUrls.length} fotos
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-lg overflow-hidden">
          {images.slice(0, 4).map((img, index) => {
            const amenity = getImageAmenity(img, index);

            return (
              <div 
                key={`image-${index}`} 
                className="relative cursor-pointer"
                onClick={() => {
                  setInitialIndex(index);
                  setIsGalleryOpen(true);
                }}
              >
                <div className="aspect-[16/10.5] relative group">
                  <Image
                    src={img}
                    alt={`${condoData.name} ${amenity ? amenity.label : `vista ${index + 1}`}`}
                    fill
                    className="object-cover rounded-xl transition-all duration-200 group-hover:brightness-75"
                  />
                  {/* Amenity label */}
                  {amenity && (
                    <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 z-10">
                      <span className="bg-black/80 text-white px-2.5 py-1 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium border border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                        {amenity.label}
                      </span>
                    </div>
                  )}
                  {/* Add gradient overlay for better label visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Arrow icon on hover */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                    <div className="bg-white rounded-full p-1.5 shadow-lg">
                      <ArrowUpRight className="h-4 w-4 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gallery Modal */}
      <GaleriaPropiedad
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={images}
        initialIndex={initialIndex}
      />

      {/* Map */}
      <div className="space-y-4 ">

        <h3 className="text-lg font-semibold">Ubicación en Google Maps</h3>
        <div className="aspect-video relative rounded-xl overflow-hidden">
          {condoData.googlePlaceId ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=place_id:${condoData.googlePlaceId}&zoom=15`}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Ubicación no disponible</span>
            </div>
          )}
        </div>
        {condoData.placeDetails?.formatted_address && (
            <a 
            href={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=place_id:${condoData.googlePlaceId}&zoom=15`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm text-gray-600 hover:text-violet-600"
            >
            <MapPin size={14} className="inline mr-1" />
            {condoData.placeDetails.formatted_address}
            </a>
        )}
      </div>

      <div className="mt-16 h-[35vh]">

        {/* Street View */}
        <div className="space-y-4 flex flex-col h-full">
          <h3 className="text-lg font-semibold">Vista de calle</h3>

            <div className="aspect-video relative rounded-xl overflow-hidden flex-grow cursor-pointer group">
            {condoData.streetViewImage ? (
              <>
              <Image
                src={condoData.streetViewImage}
                alt={`Vista de calle de ${condoData.name}`}
                fill
                className="object-cover transition-all group-hover:brightness-75"
                onClick={() => window.open(condoData.streetViewLink, '_blank')}
              />
                <div 
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => window.open(condoData.streetViewLink, '_blank')}
                >
                <span className="text-white flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                Ver en Google Street View
                <ArrowUpRight size={16} />
                </span>
                </div>
              <button
                className="absolute top-2 right-2 p-1.5 rounded-full border border-gray-300 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)] hover:bg-gray-50 hover:scale-125 hover:cursor-pointer transition-transform"
                onClick={() => window.open(condoData.streetViewLink, '_blank')}
              >
                <ArrowUpRight size={16} className="" />
              </button>
              </>
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">No hay vista de calle disponible</span>
              </div>
            )}
            </div>
          <div className="mt-auto ">
            {condoData.streetViewLink && (
                <a
                href={condoData.streetViewLink}
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

      {/* Reviews section */}
      <div className="mt-2 md:mt-16 mt-8 md:bg-white">

        <h3 className="text-xl font-semibold mb-6">Reseñas sobre {condoData.name}</h3>

        {/* Rating Overview - Mobile Only */}
        <div className="md:hidden">
          <div className="flex items-center justify-between p-4 bg-white rounded-lg mb-4">
            <div className="flex items-center gap-2">
              <Star size={24} className="fill-yellow-400 text-yellow-400" />
              <div>
                <div className="text-2xl font-semibold">{condoData.googleRating}</div>
                <div className="text-sm text-gray-500">{condoData.totalRatings} reseñas</div>
              </div>
            </div>
            {condoData.googlePlaceId && (
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${condoData.googlePlaceId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-800 flex flex-row items-center gap-1"
              >
                Ver en Google
                <ArrowUpRightIcon size={24} className="text-black" />
              </a>
            )}
          </div>
        </div>

        {/* Filter reviews to only include selected ones */}
        {(() => {
          // Filter reviews to only include those with IDs in selectedGoogleReviews
          const selectedReviews = condoData.cachedReviews?.filter(review => 
            condoData.selectedGoogleReviews?.includes(review.id || review.time?.toString())
          ) || [];

          return (
            <>
              {/* Mobile Reviews with Horizontal Scroll */}
              <div className="md:hidden relative">
                <div className="flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-4 gap-4 scrollbar-hide">
                  {selectedReviews.map((review) => (
                    <ReviewCard 
                      key={review.time}
                      review={review}
                      className="flex-shrink-0 w-[85vw] snap-center"
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Reviews Stacked */}
              <div className="hidden md:grid grid-cols-1 gap-4">
                {selectedReviews.map((review) => (
                  <ReviewCard 
                    key={review.time}
                    review={review}
                  />
                ))}
              </div>

              {(!selectedReviews || selectedReviews.length === 0) && (
                <p className="text-gray-500 italic">No hay reseñas seleccionadas disponibles</p>
              )}
            </>
          );
        })()}
      </div>

      
    </div>
  );
}

interface Review {
  time: number;
  profile_photo_url?: string;
  author_name: string;
  rating: number;
  relative_time_description: string;
  text: string;
}

const ReviewCard = ({ review, className = '' }: { review: Review; className?: string }) => (
  <div className={`bg-white rounded-xl p-6 ${className} md:shadow-[0_2px_6px_rgb(0,0,0,0.05)] shadow-lg border border-gray-200`}>

    <div className="flex items-center gap-3 mb-2">
      {review.profile_photo_url ? (
        <Image
          src={review.profile_photo_url}
          alt={review.author_name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
          <span className="text-violet-600 font-medium">
            {review.author_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
      <div>
        <p className="font-medium">{review.author_name}</p>
        <div className="flex items-center text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < review.rating ? 'fill-yellow-400' : 'text-gray-200'}
            />
          ))}
          <span className="ml-2 text-xs text-gray-500">{review.relative_time_description}</span>
        </div>
      </div>
    </div>
    <p className="text-gray-600 text-sm">{review.text}</p>
  </div>
);