import { motion } from 'framer-motion';
import { MessageCircle, Info } from 'lucide-react';

interface WhatsAppButtonProps {
  propertyType: string;
  transactionTypes: string[];
  condoName?: string;
  zoneName?: string;
  advisorPhone: string;
  propertyId: string;
  price: number;
}

export default function WhatsAppButton({
  propertyType,
  transactionTypes,
  condoName,
  zoneName,
  advisorPhone,
  propertyId,
  price
}: WhatsAppButtonProps) {
  const handleWhatsAppClick = () => {
    const message = `Hola, me interesa ${propertyType === 'casa' ? 'la casa' : 'el departamento'} ${transactionTypes.includes('renta') ? 'en renta' : 'en venta'} ${condoName ? `en ${condoName}` : ''} ${zoneName ? `en ${zoneName}` : ''}`;
    const url = `https://wa.me/${advisorPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-[0_-1px_12px_rgba(0,0,0,0.07)] px-4 py-3 z-50 border-t border-gray-300"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div>
          {/* <p className="text-gray-500 text-sm">
            {transactionTypes.includes('renta') ? 'Renta' : 'Venta'}
          </p> */}
          <p className="text-xl font-semibold">
            {/* ${price.toLocaleString('es-MX')}
            {transactionTypes.includes('renta') ? '/mes' : ''} */}
          </p>
        </div>
        
        <motion.button
          onClick={handleWhatsAppClick}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="font-medium text-sm py-2">Contactar por WhatsApp</span>
          <MessageCircle className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}