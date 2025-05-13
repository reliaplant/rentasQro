import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WhatsAppButtonProps {
  propertyType: string;
  transactionType: string;
  condoName?: string;
  zoneName?: string;
  advisorPhone: string;
  propertyId: string;
  price: number;
  contactRef: React.RefObject<HTMLDivElement>;
}

export default function WhatsAppButton({
  propertyType,
  transactionType,
  condoName,
  zoneName,
  advisorPhone,
  propertyId,
  price,
  contactRef
}: WhatsAppButtonProps) {
  const searchParams = useSearchParams();
  const [promoCode, setPromoCode] = useState<string | null>(null);
  
  // Extract UTM campaign code on component mount - only use utm_campaign
  useEffect(() => {
    const campaign = searchParams?.get('utm_campaign');
    // Only set the code if campaign exists and is not null or empty
    if (campaign && campaign.trim() !== '') {
      setPromoCode(campaign);
    } else {
      setPromoCode(null);
    }
  }, [searchParams]);

  const handleWhatsAppClick = () => {
    // Handle different property types in the message
    let propertyTypeText = 'la propiedad';
    
    if (propertyType === 'casa') propertyTypeText = 'la casa';
    else if (propertyType === 'departamento' || propertyType === 'depa') propertyTypeText = 'el departamento';
    else if (propertyType === 'terreno') propertyTypeText = 'el terreno';
    else if (propertyType === 'local') propertyTypeText = 'el local comercial';
    
    // Create a clean URL without UTM parameters
    const cleanPropertyUrl = `https://pizo.mx/propiedad/${propertyId}`;
    
    // Construct the message with the clean URL
    let message = `Hola, me interesa ${propertyTypeText} ${transactionType === 'renta' ? 'en renta' : 'en venta'}`;
    
    // Add condo or zone if available
    if (condoName) {
      message += ` en ${condoName}`;
    }
    
    if (zoneName && !condoName) {
      message += ` en ${zoneName}`;
    }
    
    // Add the clean property URL
    message += `\n\n${cleanPropertyUrl}`;
    
    // Add the promo code as a hashtag if it exists
    if (promoCode) {
      message += `\n\n#${promoCode}`;
    }
    
    // Open WhatsApp with the new message
    const url = `https://wa.me/${advisorPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-[0_-1px_12px_rgba(0,0,0,0.07)] px-4 py-3 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto pb-3">
        <div>
          <p className="text-gray-500 text-sm">
            {transactionType === 'renta' ? 'Renta' : 'Venta'}
          </p>
          <p className="text-xl font-semibold">
            {transactionType === 'renta' ? (  
              <>
                ${price.toLocaleString('es-MX')} / <span className="text-sm">mes</span>
              </>
            ) : (
              `${(price / 1000000).toFixed(1)} MDP`
            )}
          </p>
        </div>
        
        <motion.button
          onClick={handleWhatsAppClick}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white transition-transform duration-300 hover:scale-110 transition-colors">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
            <span className="font-medium text-sm py-2 whitespace-nowrap">Contactar</span>
        </motion.button>
      </div>
    </motion.div>
  );
}