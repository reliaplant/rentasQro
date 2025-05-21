import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  googlePlaceId?: string;
  formattedAddress?: string;
}

export default function GoogleMap({ googlePlaceId, formattedAddress }: GoogleMapProps) {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border-2 border-gray-200/60">
      {googlePlaceId ? (
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
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
  );
}
