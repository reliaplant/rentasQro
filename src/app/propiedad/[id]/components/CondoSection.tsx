import Image from 'next/image';
import { Star, MapPin, Shield, X, CheckCircle, WashingMachine, ArrowUpRight, ArrowUpRightIcon } from 'lucide-react';
import { CondoData } from '@/app/shared/interfaces';
import { condoAmenities } from '@/app/constants/amenities';
// import Reviews from './reviews';
import { CheckmarkFilled, CloseFilled, Misuse, WordCloud, Education, Building, Sprout, Tree, Box, Temperature, Fire, Restaurant } from '@carbon/icons-react';
import { PiXFill } from 'react-icons/pi';
import ZibataMap from '@/app/components/ZibataMap';
import GaleriaPropiedad from './galeriaPropiedad';
import { useState } from 'react';

interface CondoSectionProps {
  condoData: CondoData | null;
}

export default function CondoSection({ condoData }: CondoSectionProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  if (!condoData) return null;

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
                  Tu XXX estará ubicado en este exclusivo condominio
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

      {/* Zibata Map Section */}
      {condoData.polygonId && (
        <div className="mt-12 mb-12">
          <h3 className="text-lg font-semibold mb-4">Mapa interactivo de Zibata</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-[80vh]">
            <ZibataMap highlightedPolygonId={condoData.polygonId} />
          </div>
        </div>
      )}

      {/* Amenities Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 ">Amenidades de este lugar</h3>

        <div className="grid grid-cols-2 gap-2">
          {/* Included Amenities */}
          <div className="rounded-xl p-4 bg-gray-50">
            <h4 className="text-base font-bold mb-3 text-black flex items-center gap-2">
              <CheckmarkFilled size={16} className="text-green-600" />
              Incluye
            </h4>
            <div className="space-y-2">
              {(condoData.amenities || []).map((amenityId) => {
                const amenityDetails = condoAmenities.find(a => a.id === amenityId);
                if (!amenityDetails) return null;

                return (
                  <div key={amenityId} className="flex items-center gap-2">
                    <div className="">
                      {amenityDetails.label === 'General' && <Building size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Alberca' && <WashingMachine size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Gimnasio' && <Education size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Salón de eventos' && <Building size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Área de asadores' && <Fire size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Sauna' && <Temperature size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Business Center' && <Box size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Parque infantil' && <Sprout size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Ludoteca' && <Tree size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Vigilancia' && <Shield size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Areas verdes' && <Sprout size={16} className="text-gray-600" />}
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

          {/* Not Included Amenities */}
          <div className="bg-gray-50 rounded-xl p-4 ">
            <h4 className="font-bold mb-3  flex items-center gap-2">
              <Misuse size={16} className="text-red-700" />
              No incluye
            </h4>

            <div className="space-y-2">
              {condoAmenities
                .filter(amenity => !condoData.amenities?.includes(amenity.id))
                .map((amenityDetails) => (
                  <div key={amenityDetails.id} className="flex items-center gap-2">
                    <div className="">
                      {amenityDetails.label === 'General' && <Building size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Alberca' && <WashingMachine size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Gimnasio' && <Education size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Salón de eventos' && <Building size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Área de asadores' && <Fire size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Sauna' && <Temperature size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Business Center' && <Box size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Parque infantil' && <Sprout size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Ludoteca' && <Tree size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Vigilancia' && <Shield size={16} className="text-gray-600" />}
                      {amenityDetails.label === 'Areas verdes' && <Sprout size={16} className="text-gray-600" />}
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
      <div className="mt-12 mb-12 px-6 md:px-0">
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
          {(condoData.imageUrls || []).slice(0, 4).map((img, index) => {
            const amenityId = condoData.amenities?.[index];
            const amenity = amenityId ? condoAmenities.find(a => a.id === amenityId) : null;

            return (
              <div 
                key={index} 
                className="relative cursor-pointer"
                onClick={() => {
                  setInitialIndex(index);
                  setIsGalleryOpen(true);
                }}
              >
                <div className="aspect-[16/10.5] relative group"> {/* Added relative and group */}
                  <Image
                  src={img || '/placeholder-image.png'}
                  alt={`${condoData.name} vista ${index + 1}`}
                  fill
                  className="object-cover rounded-xl transition-all duration-200 group-hover:brightness-75" /* Added transition and hover effect */
                  />
                  {amenity && (
                  <div className="absolute bottom-1 left-1 md:bottom-4 md:left-4">
                  <span className="bg-black/90 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium border border-gray-700 shadow-[0_2px_3px_rgba(0,0,0,0.2)]">
                  {amenity.label}
                  </span>
                  </div>
                  )}
                  {/* Added arrow icon on hover */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all" />
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
        images={condoData.imageUrls || []}
        initialIndex={initialIndex}
      />

      {/* Map */}
      <div className="space-y-4 px-6 md:px-0">

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

      <div className="mt-16 h-[35vh] md:px-0 px-6">

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
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
      <div className="mt-2 md:mt-16 mt-8 md:bg-white bg-gray-50 md:p-0 p-8">

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

        {/* Mobile Reviews with Horizontal Scroll */}
        <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory -mx-8 px-8 pb-4 gap-4 scrollbar-hide">
          {condoData.cachedReviews?.slice(0, 3).map((review) => (
            <ReviewCard 
              key={review.time}
              review={review}
              className="flex-shrink-0 w-[85vw] snap-center"
            />
          ))}
        </div>

        {/* Desktop Reviews Stacked */}
        <div className="hidden md:grid grid-cols-1 gap-4">
          {condoData.cachedReviews?.slice(0, 3).map((review) => (
            <ReviewCard 
              key={review.time}
              review={review}
            />
          ))}
        </div>

        {(!condoData.cachedReviews || condoData.cachedReviews.length === 0) && (
          <p className="text-gray-500 italic">No hay reseñas disponibles</p>
        )}
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