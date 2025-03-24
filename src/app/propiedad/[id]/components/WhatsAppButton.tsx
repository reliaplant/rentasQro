import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  propertyType: string;
  transactionTypes: string[];
  condoName?: string;
  zoneName?: string;
  advisorPhone: string;
  propertyId: string;
//   onWhatsAppClick: (propertyId: string) => void;
}

export default function WhatsAppButton({
  propertyType,
  transactionTypes,
  condoName,
  zoneName,
  advisorPhone,
  propertyId,
//   onWhatsAppClick
}: WhatsAppButtonProps) {
  const handleClick = () => {
    // onWhatsAppClick(propertyId);
    
    const message = `Hola, me interesa ${propertyType === 'casa' ? 'la casa' : 'el departamento'} ${transactionTypes.includes('renta') ? 'en renta' : 'en venta'} ${condoName ? `en ${condoName}` : ''} ${zoneName ? `en ${zoneName}` : ''}`;
    const url = `https://wa.me/${advisorPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      className="md:hidden fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg z-50"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 1 
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="sr-only">Contactar por WhatsApp</span>
      
      <motion.div
        className="absolute inset-0 rounded-full bg-green-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0, 0.6]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        style={{ zIndex: -1 }}
      />
    </motion.button>
  );
}