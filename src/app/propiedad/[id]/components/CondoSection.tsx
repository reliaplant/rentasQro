import Image from 'next/image';
import { Star, MapPin, Shield, X, CheckCircle, WashingMachine } from 'lucide-react';
import { CondoData } from '@/app/interfaces';
import { condoAmenities } from '@/app/constants/amenities';
import Reviews from './reviews';
import { CheckmarkFilled, CloseFilled, Misuse, WordCloud, Education, Building, Sprout, Tree, Box, Temperature, Fire, Restaurant } from '@carbon/icons-react';
import { PiXFill } from 'react-icons/pi';

interface CondoSectionProps {
  condoData: CondoData | null;
}

export default function CondoSection({ condoData }: CondoSectionProps) {
  if (!condoData) return null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Modern Header with Logo & Title */}
      <div className="bg-white overflow-hidden mb-12">
        {/* Hero Banner */}

        {/* Content Area */}
        <div className="flex gap-6 border  rounded-2xl border-gray-200 flex flex-row items-center p-4 bg-gradient-to-r from-blue-50 to-gray-50  ">

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
                  <h2 className="text-2xl font-bold ">{condoData.name}</h2>

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
                    className="border-gray-200 rounded-lg text-sm text-gray-400 hover:bg-gray-50 flex items-center gap-1"
                  >

                    - Según reseñas de Google
                    <MapPin size={14} />
                  </a>
                )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
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
        <p className="text-gray-700 whitespace-pre-line">{condoData.description}</p>
      </div>

      {/* Amenities Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Amenidades de este lugar</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Included Amenities */}
          <div className="rounded-xl p-4 bg-gray-50">
            <h4 className="text-base font-bold mb-3 text-black flex items-center gap-2">
              <CheckmarkFilled size={16} className="text-green-600" />
              Incluye
            </h4>
            <div className="space-y-2">
              {condoData.amenities.map((amenityId) => {
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
                    <span className="text-sm text-gray-700 font-medium">
                      {amenityDetails.label}
                    </span>
                  </div>
                );
              })}

              {condoData.amenities.length === 0 && (
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
                .filter(amenity => !condoData.amenities.includes(amenity.id))
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
                    <span className="text-sm text-gray-700 font-medium">
                      {amenityDetails.label}
                    </span>
                  </div>
                ))}

              {condoAmenities.length === condoData.amenities.length && (
                <p className="text-xs text-gray-500 italic">Todas las amenidades están incluidas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Photo Grid */}
      <div className="mt-12 mb-12 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Galería de {condoData.name}</h3>
          {condoData.imageUrls.length > 6 && (
            <button className="text-sm text-gray-400 hover:text-gray-800 cursor-pointer transition-colors flex items-center gap-1">
              Ver todas las {condoData.imageUrls.length} fotos
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1 rounded-lg overflow-hidden" style={{ maxHeight: '30vh' }}>
          {/* Featured image (larger) */}
          <div className="col-span-2 row-span-2 relative h-full">
            <Image
              src={condoData.imageUrls[0] || '/placeholder-image.png'}
              alt={`${condoData.name} vista principal`}
              fill
              className="object-cover"
            />
            {condoData.amenities[0] && (
              <div className="absolute bottom-2 left-2">
                <span className="bg-white border text-gray-800 px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  {condoAmenities.find(a => a.id === condoData.amenities[0])?.label || ''}
                </span>
              </div>
            )}
          </div>
          
          {/* Smaller images */}
          {condoData.imageUrls.slice(1, 5).map((img, index) => {
            const realIndex = index + 1; // Adjust index for amenities array
            const amenityId = condoData.amenities[realIndex];
            const amenity = amenityId ? condoAmenities.find(a => a.id === amenityId) : null;
            
            return (
              <div key={realIndex} className="relative">
                <div className="aspect-square">
                  <Image
                    src={img || '/placeholder-image.png'}
                    alt={`${condoData.name} vista ${realIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                    {amenity && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-black border border-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-md px-3 font-semibold">
                      <>
                        {amenity.label === 'General' && <Building size={13} className="mr-1 inline" />}
                        {amenity.label === 'Alberca' && <WashingMachine size={13} className="mr-1 inline" />}
                        {amenity.label === 'Gimnasio' && <Education size={13} className="mr-1 inline" />}
                        {amenity.label === 'Salón de eventos' && <Building size={13} className="mr-1 inline" />}
                        {amenity.label === 'Área de asadores' && <Fire size={13} className="mr-1 inline" />}
                        {amenity.label === 'Sauna' && <Temperature size={13} className="mr-1 inline" />}
                        {amenity.label === 'Business Center' && <Box size={13} className="mr-1 inline" />}
                        {amenity.label === 'Parque infantil' && <Sprout size={13} className="mr-1 inline" />}
                        {amenity.label === 'Ludoteca' && <Tree size={13} className="mr-1 inline" />}
                        {amenity.label === 'Vigilancia' && <Shield size={13} className="mr-1 inline" />}
                        {amenity.label === 'Areas verdes' && <Sprout size={13} className="mr-1 inline" />}
                        {amenity.label}
                      </>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Last image with "see more" overlay */}
          {condoData.imageUrls.length > 5 && (
            <div className="relative">
              <div className="aspect-square">
                <Image
                  src={condoData.imageUrls[5] || '/placeholder-image.png'}
                  alt={`${condoData.name} vista adicional`}
                  fill
                  className="object-cover brightness-75"
                />
                {condoData.imageUrls.length > 6 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      +{condoData.imageUrls.length - 5}
                    </span>
                  </div>
                )}
                {condoData.amenities[5] && !condoData.imageUrls[5].endsWith('placeholder-image.png') && (
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-white/90 text-gray-800 px-2 py-0.5 rounded-full text-xs font-medium shadow-sm">
                      {condoAmenities.find(a => a.id === condoData.amenities[5])?.label || ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ubicación del Condominio</h3>
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
          <p className="text-sm text-gray-600">
            <MapPin size={16} className="inline mr-1" />
            {condoData.placeDetails.formatted_address}
          </p>
        )}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-8">
        {/* Street View */}
        <div className="space-y-4 flex flex-col h-full">
          <h3 className="text-lg font-semibold">Vista de calle</h3>
          <div className="aspect-video relative rounded-xl overflow-hidden flex-grow">
            {condoData.streetViewImage ? (
              <Image
                src={condoData.streetViewImage}
                alt={`Vista de calle de ${condoData.name}`}
                fill
                className="object-cover"
              />
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
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-700"
              >
                <MapPin size={16} className="mr-1" />
                Ver en Google Street View
              </a>
            )}
          </div>
        </div>

        {/* Global Review Stats */}
        <div className="flex flex-col h-full space-y-4 ">
          <h3 className="text-lg font-semibold ">Valoración</h3>
          <div className="mt-1 rounded-xl bg-gray-50 flex flex-col items-center justify-between p-10 flex-grow ">
            <div className="flex flex-col items-center gap-3 my-auto">
              <div className="flex items-center gap-2">
                <Star size={28} className="fill-yellow-400 text-yellow-400" />
                <span className="text-4xl font-semibold">{condoData.googleRating}</span>
              </div>
              <div className="text-gray-600">
                <span className="font-medium">{condoData.totalRatings}</span> reseñas en Google
              </div>
            </div>

            <div className="mt-4">
              {condoData.googlePlaceId && (
                <a
                  href={`https://www.google.com/maps/place/?q=place_id:${condoData.googlePlaceId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2"
                >
                  Ver en Google
                  <span className="text-gray-400">↗</span>
                </a>
              )}
            </div>


          </div>
          <div className="h-6">


          </div>
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-16 rounded-2xl bg-gray-50 p-8">
        <h3 className="text-lg font-semibold mb-6">Reseñas de quienes viven en {condoData.name}</h3>

        <div className="space-y-6">
          {condoData.cachedReviews?.slice(0, 3).map((review) => (
            <div key={review.time} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
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
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
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
          ))}

          {(!condoData.cachedReviews || condoData.cachedReviews.length === 0) && (
            <p className="text-gray-500 italic">No hay reseñas disponibles</p>
          )}
        </div>
      </div>










    </div>
  );
}