import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  googlePlaceId?: string;
  formattedAddress?: string;
}

export default function GoogleMap({ googlePlaceId, formattedAddress }: GoogleMapProps) {
  return (
    <div className="space-y-3 md:space-y-4 px-4 md:px-6">
      <h3 className="text-base md:text-lg font-semibold">Ubicación en Google Maps</h3>
      <div className="aspect-[4/3] md:aspect-video relative rounded-lg overflow-hidden">
        {googlePlaceId ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&q=place_id:${googlePlaceId}&zoom=15`}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Ubicación no disponible</span>
          </div>
        )}
      </div>
      {formattedAddress && (
        <a 
          href={`https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs md:text-sm text-gray-600 hover:text-violet-600 block"
        >
          <MapPin size={14} className="inline mr-1" />
          <span className="text-xs line-clamp-1">{formattedAddress}</span>
        </a>
      )}
    </div>
  );
}
