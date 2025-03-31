import Image from 'next/image';
import { Heart, Share2, CheckCircle, Eye, MessageSquare, Home, Star, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { incrementWhatsappClicks } from '@/app/shared/firebase';
import { useEffect, useState } from 'react';
import { useFavorites } from '@/app/shared/hooks/useFavorites';

interface ContactoProps {
  price: number;
  advisor: {
    name: string;
    photo?: string;
    phone?: string;
    bio?: string;
    verified?: boolean;
  };
  propertyId: string;
  publicationDate: Date | Timestamp; // Update type to accept both
  views: number;
  whatsappClicks: number;
}

export default function Contacto({
  price,
  advisor,
  propertyId,
  publicationDate,
  views,
  whatsappClicks
}: ContactoProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isFav, setIsFav] = useState(false);
  
  // Initialize favorite state once component mounts (to avoid hydration issues)
  useEffect(() => {
    setIsFav(isFavorite(propertyId));
  }, [propertyId, isFavorite]);
  
  const legalPolicyPrice = price * 0.75; // 75% of rent price
  const discountedPolicyPrice = legalPolicyPrice * 0.65; // 35% discount

  const handleWhatsAppClick = async () => {
    try {
      await incrementWhatsappClicks(propertyId);
    } catch (error) {
      console.error('Error al registrar clic:', error);
    }
  };
  
  const handleFavoriteClick = () => {
    toggleFavorite(propertyId);
    setIsFav(!isFav);
  };

  const getPublicationTime = (date: Date | Timestamp) => {
    const now = new Date();
    let published: Date;

    if (date instanceof Timestamp) {
      published = date.toDate();
    } else if (date instanceof Date) {
      published = date;
    } else {
      // Fallback if date is neither
      published = new Date(date);
    }

    const diffDays = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Publicado hoy';
    if (diffDays === 1) return 'Publicado ayer';
    return `Publicado hace ${diffDays} días`;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg">
      {/* Stats Bar */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>{getPublicationTime(publicationDate)}</span>
        <div className="flex items-center justify-between text-gray-500 gap-2">
            <button 
              onClick={handleFavoriteClick} 
              className="flex items-center gap-2 text-sm hover:text-pink-500 transition-colors group"
              aria-label={isFav ? "Eliminar de favoritos" : "Agregar a favoritos"}
            >
              <Heart 
                size={20} 
                className={`${isFav ? "fill-pink-500 text-pink-500" : ""} hover:fill-pink-500 hover:text-pink-500 hover:scale-125 transition-transform cursor-pointer`} 
              />
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-violet-500 transition-colors group">
            <Share2 size={20} className="hover:text-violet-500 hover:scale-125 transition-transform cursor-pointer" />
            </button>
        </div>
      </div>

      {/* Prices */}
      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Renta mensual</p>
          <p className="text-2xl font-semibold">${price.toLocaleString()}</p>
        </div>
        <div className='border-t border-gray-200 pt-3'>
        <p className='mb-2'>Requisitos</p>
        <p className="text-xs text-gray-500">- Contrato anual</p>
        <p className="text-xs text-gray-500">- 1 més de deposito</p>
            <div className="flex items-center gap-2">
            <p className="text-xs text-gray-500">- Póliza jurídica</p>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-gray-500">
              ${discountedPolicyPrice.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 line-through">
              ${legalPolicyPrice.toLocaleString()}
              </p>
              <span className="text-xs font-medium text-violet-800 bg-violet-50 px-1 py-0.5 rounded">
              -35%
              </span>
            </div>
            </div>
        </div>
      </div>

      {/* Advisor Info */}
      <div className="bg-gradient-to-l from-violet-50 to-violet-100 p-2 flex items-start gap-3 mb-6 rounded-xl">
        {/* Avatar */}
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden relative flex-shrink-0">
            {advisor.photo ? (
              <Image
                src={advisor.photo}
                alt={advisor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#F5E6D3] text-[#D2B48C] grid place-items-center">
                {advisor.name[0]}
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex flex-col">
            <span className='text-violet-800 text-[10px]'>Asesor inmobiliario</span>
            <span className='text-black text-sm'>{advisor.name} </span>
            <div className='mt-0.5 flex flex-row gap-3 items-center'>
              <span className="bg-violet-100 rounded-full border border-violet-500 flex flex-row items-center gap-1 text-[9px] px-2 text-violet-700 w-fit pl-1.5">
                <CheckCircle size={9} className="text-violet-700" />
                Verificado
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-black">
                <Star size={12} className="text-black" />
                4.9/5
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp button */}
      <a
        href={`https://wa.me/${advisor.phone?.replace(/\D/g, '')}?text=Hola, me interesa esta propiedad`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        className="w-full bg-black hover:bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02] transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white transition-transform duration-300 hover:scale-110 transition-colors">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="text-white transition-colors">Contactar por WhatsApp</span>
      </a>
    </div>
  );
}
