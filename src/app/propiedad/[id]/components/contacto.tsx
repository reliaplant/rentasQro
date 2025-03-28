import Image from 'next/image';
import { Heart, Share2, CheckCircle, Eye, MessageSquare, Home, Star, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { incrementWhatsappClicks } from '@/app/shared/firebase';

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
  const legalPolicyPrice = price * 0.75; // 75% of rent price
  const discountedPolicyPrice = legalPolicyPrice * 0.65; // 35% discount

  const handleWhatsAppClick = async () => {
    try {
      await incrementWhatsappClicks(propertyId);
    } catch (error) {
      console.error('Error al registrar clic:', error);
    }
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
          <button className="flex items-center gap-2 text-sm hover:text-gray-900 transition-colors">
            <Heart size={18} />
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-gray-900 transition-colors">
            <Share2 size={18} />
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
              <span className="text-xs font-medium text-blue-800 bg-blue-50 px-1 py-0.5 rounded">
              -35%
              </span>
            </div>
            </div>
        </div>
      </div>

      {/* Advisor Info */}
      <div className="bg-gradient-to-l from-blue-50 to-blue-100 p-2 flex items-start gap-3 mb-6 rounded-xl">
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
            <span className='text-blue-800 text-[10px]'>Asesor inmobiliario</span>
            <span className='text-black text-sm'>{advisor.name} </span>
            <div className='mt-0.5 flex flex-row gap-3 items-center'>
              <span className="bg-blue-100 rounded-full border border-blue-500 flex flex-row items-center gap-1 text-[9px] px-2 text-blue-700 w-fit pl-1.5">
                <CheckCircle size={9} className="text-blue-700" />
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

      {/* Updated WhatsApp button */}
      <a
        href={`https://wa.me/${advisor.phone?.replace(/\D/g, '')}?text=Hola, me interesa esta propiedad`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        className="w-full bg-black hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        Contactar por WhatsApp
      </a>
    </div>
  );
}
