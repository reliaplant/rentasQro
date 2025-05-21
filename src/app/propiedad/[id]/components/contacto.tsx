import Image from 'next/image';
import { Heart, Share2, CheckCircle, Eye, MessageSquare, Home, Star, Clock } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { incrementWhatsappClicks } from '@/app/shared/firebase';
import { useEffect, useState, useRef, RefObject } from 'react';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';
import Head from 'next/head';
import { calculatePolicyCost, calculateDiscountedPolicyCost } from '@/app/shared/services/policyCalculator';
import WhatsAppButton from './WhatsAppButton';

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
  title?: string;
  description?: string;
  location?: string;
  propertyType?: string;
  imageUrl?: string;
  transactionType?: string;
  condoName?: string;
  zoneName?: string;
}

export default function Contacto({
  price,
  advisor,
  propertyId,
  publicationDate,
  views,
  whatsappClicks,
  title = 'Contacta el equipo de pizo mx',
  description = 'Ponte en contacto con nuestro asesor inmobiliario verificado para obtener más información sobre esta propiedad.',
  location = '',
  propertyType = '',
  imageUrl = '',
  transactionType = '',
  condoName = '',
  zoneName = ''
}: ContactoProps) {
  // Add logging for debugging
  console.log("Contacto component - Advisor data:", advisor);
  
  // Create a ref for the component
  const contactRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  
  // Create fallback data when advisor info is missing
  const advisorName = advisor?.name || 'Asesor Pizo';
  const advisorPhone = advisor?.phone || '4421234567';
  const advisorPhoto = advisor?.photo || '';
  const isVerified = advisor?.verified !== false; // Default to true unless explicitly false
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isFav, setIsFav] = useState(false);
  const { exchangeRate, convertMXNtoUSD } = useExchangeRate();
  const [selectedCurrency, setSelectedCurrency] = useState<'MXN' | 'USD'>('MXN');
  
  // Initialize favorite state once component mounts (to avoid hydration issues)
  useEffect(() => {
    setIsFav(isFavorite(propertyId));
    
    // Check localStorage for currency preference
    if (typeof window !== 'undefined') {
      try {
        const filtersJson = localStorage.getItem('propertyFilters');
        if (filtersJson) {
          const filters = JSON.parse(filtersJson);
          if (filters && (filters.currency === 'USD' || filters.currency === 'MXN')) {
            setSelectedCurrency(filters.currency);
            console.log('Setting currency from localStorage:', filters.currency);
          }
        }
      } catch (error) {
        console.error('Error reading currency from localStorage:', error);
      }
    }
  }, [propertyId, isFavorite]);
  
  // Also update localStorage when currency is changed from this component
  const handleCurrencyChange = (currency: 'MXN' | 'USD') => {
    setSelectedCurrency(currency);
    
    // Update localStorage
    try {
      const filtersJson = localStorage.getItem('propertyFilters');
      let filters = filtersJson ? JSON.parse(filtersJson) : {};
      filters.currency = currency;
      localStorage.setItem('propertyFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error updating currency in localStorage:', error);
    }
  };
  
  // Get the price in the selected currency
  const getDisplayPrice = () => {
    if (selectedCurrency === 'USD') {
      return convertMXNtoUSD(price);
    }
    return price;
  };
  
  // Determine if it's a rental property based on price (simple heuristic)
  const isRental = transactionType === 'renta' || (price > 0 && price < 20000);
  
  // Calculate policy costs using the service (only for rentals)
  // Use try/catch to handle potential errors in calculation
  let legalPolicyPrice = 0;
  let discountedPolicyPrice = 0;
  const discountPercent = 15; // Changed from 35% to 15%
  
  try {
    if (isRental) {
      legalPolicyPrice = calculatePolicyCost(price, 'kanun');
      discountedPolicyPrice = calculateDiscountedPolicyCost(price, 'kanun', discountPercent);
      
      // Add debug logging to verify calculations
      console.log('Rent amount:', price);
      console.log('Policy price (original):', legalPolicyPrice);
      console.log('Policy price (discounted):', discountedPolicyPrice);
    }
  } catch (error) {
    console.error('Error calculating policy prices:', error);
  }

  const handleWhatsAppClick = async () => {
    try {
      await incrementWhatsappClicks(propertyId);
    } catch (error) {
      console.error('Error al registrar clic:', error);
    }
  };

  // Create a better structured WhatsApp message
  const constructWhatsAppMessage = () => {
    const propertyTypeText = propertyType === 'casa' ? 'la casa' : 
                            propertyType === 'departamento' ? 'el departamento' : 
                            'la propiedad';
    
    const transactionTypeText = price > 0 && price < 20000 ? 'en renta' : 'en venta';
    
    const locationText = location ? ` en ${location}` : '';
    
    return `Hola ${advisorName}, me interesa ${propertyTypeText} ${transactionTypeText}${locationText} que vi en PIZO (ID: ${propertyId}). ¿Podrías darme más información? Gracias.`;
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": advisor.name,
    "telephone": advisor.phone,
    "image": advisor.photo,
    "description": advisor.bio,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Querétaro",
      "addressRegion": "QRO",
      "addressCountry": "MX"
    }
  };

  const propertyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Property",
    "name": title,
    "description": description,
    "price": `${price} MXN`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": location
    },
    "propertyType": propertyType,
    "image": imageUrl
  };

  return (
    <>
      <Head>
        <title>{`${title} | Pizo MX`}</title>
        <meta name="description" content={description} />
        
        {/* OpenGraph tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="realestate.agent" />
        <meta property="og:image" content={advisor.photo || '/default-agent.jpg'} />
        <meta property="og:price:amount" content={price.toString()} />
        <meta property="og:price:currency" content="MXN" />
        <meta property="og:availability" content="available" />
        
        {/* Twitter tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={advisor.photo || '/default-agent.jpg'} />
        
        {/* Additional meta tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content={advisor.name} />
        <meta name="publisher" content="Pizo MX" />

        {/* Structured data */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
        />
      </Head>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-lg" ref={contactRef}>
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

          </div>
        </div>

        {/* Prices */}
        <div className="space-y-4 mb-6">
          <div>
            <p className="text-sm text-gray-500">
              {isRental ? 'Renta mensual' : 'Precio de venta'}
            </p>
            <p className="text-2xl font-semibold">
              ${getDisplayPrice().toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
              <span className="text-base font-normal text-gray-500"> {selectedCurrency}{isRental && '/mes'}</span>
            </p>
            {selectedCurrency === 'USD' && (
              <p className="text-xs text-gray-500 mt-1 italic">
                *Precio en USD referencial (1 USD = {exchangeRate} MXN). Contacta para precio exacto.
              </p>
            )}
          </div>
          
          {/* Currency toggle */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-500">Ver precio en:</span>
            <div className="flex bg-gray-100 rounded-full p-0.5">
              {['MXN', 'USD'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr as 'MXN' | 'USD')}
                  className={`
                    px-2 py-1 rounded-full text-xs font-medium transition-all duration-200
                    ${selectedCurrency === curr
                      ? 'bg-white text-violet-700 shadow-sm'
                      : 'text-gray-500 hover:text-violet-600'}
                  `}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
          
          {/* Only show rental requirements for rental properties */}
          {isRental && (
            <div className='border-t border-gray-200 pt-3'>
              <p className='mb-2'>Requisitos</p>
              <p className="text-xs text-gray-500">- Contrato anual</p>
              <p className="text-xs text-gray-500">- 1 més de depósito</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">- Póliza jurídica</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-gray-500">
                    ${selectedCurrency === 'USD' 
                      ? convertMXNtoUSD(discountedPolicyPrice).toLocaleString(undefined, {maximumFractionDigits: 0}) 
                      : Math.round(discountedPolicyPrice).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400 line-through">
                    ${selectedCurrency === 'USD'
                      ? convertMXNtoUSD(legalPolicyPrice).toLocaleString(undefined, {maximumFractionDigits: 0})
                      : Math.round(legalPolicyPrice).toLocaleString()}
                  </p>
                  <span className="text-xs font-medium text-violet-800 bg-violet-50 px-1 py-0.5 rounded">
                    -{discountPercent}%
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Show financing info for sale properties */}
          {!isRental && (
            <div className='border-t border-gray-200 pt-3'>
              <p className='mb-2 text-sm font-medium'>Financiamiento disponible</p>
              <p className="text-xs text-gray-600 mt-2">Contáctanos para más información sobre opciones de financiamiento.</p>
            </div>
          )}
        </div>

        {/* Advisor Info - Redesigned with 3 columns */}
        <div className="bg-gradient-to-l from-violet-50 to-violet-100 p-2 flex items-center gap-3 mb-6 rounded-xl">
          {/* Column 1: Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden relative">
                {advisorPhoto ? (
                <Image
                  src={advisorPhoto}
                  alt={advisorName}
                  fill
                  className="object-cover ring-2 ring-violet-500"
                />
                ) : (
                <div className="w-full h-full bg-[#F5E6D3] text-[#D2B48C] grid place-items-center rounded-full ring-2 ring-violet-500">
                  {advisorName[0]}
                </div>
                )}
            </div>
          </div>
          
          {/* Column 2: Advisor Info */}
          <div className="flex-1">
            <div className="flex flex-col">
              <span className='text-violet-800 text-[12px]'>Asesor PIZO</span>
              <span className='text-black text-sm font-medium'>{advisorName}</span>
            </div>
          </div>
          
          {/* Column 3: Verification Badge */}
          <div className="flex-shrink-0">
            <span className="bg-blue-500 rounded-full border border-blue-500 flex items-center gap-1 text-[9px] px-2 mr-4 py-0.5 text-white whitespace-nowrap">
              <CheckCircle size={9} className="text-white" />
              Verificado
            </span>
          </div>
        </div>

        {/* WhatsApp button with inline variant */}
        <WhatsAppButton
          propertyType={propertyType || 'propiedad'}
          transactionType={transactionType || (isRental ? 'renta' : 'venta')}
          condoName={condoName || ''}
          zoneName={zoneName || location}
          advisorPhone={advisorPhone}
          propertyId={propertyId}
          price={price}
          variant="inline"
          showPrice={false}
        />
      </div>
    </>
  );
}
