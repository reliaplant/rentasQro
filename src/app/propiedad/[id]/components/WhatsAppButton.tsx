import { useEffect, useState, useRef } from 'react';
import { useExchangeRate } from '@/app/hooks/useExchangeRate';
import { useUtmParams } from '@/app/hooks/useUtmParams';
import { createNegocio } from '@/app/shared/firebase'; // Import the createNegocio function
import { Timestamp } from 'firebase/firestore'; // Import Timestamp for date fields

interface WhatsAppButtonProps {
  propertyType: string;
  transactionType: string;
  condoName?: string;
  zoneName?: string;
  advisorPhone: string;
  propertyId: string;
  price: number;
  contactRef?: React.RefObject<HTMLDivElement>;
  variant?: 'fixed' | 'inline';
  showPrice?: boolean;
}

export default function WhatsAppButton({
  propertyType,
  transactionType,
  condoName,
  zoneName,
  advisorPhone,
  propertyId,
  price,
  contactRef,
  variant = 'inline',
  showPrice = variant === 'fixed'
}: WhatsAppButtonProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<'MXN' | 'USD'>('MXN');
  const { exchangeRate, convertMXNtoUSD } = useExchangeRate();
  const { utmParams, formatUtmParamsForUrl } = useUtmParams();
  
  // Simple state for name modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [nameError, setNameError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load currency preference from localStorage
  useEffect(() => {
    const loadCurrency = () => {
      try {
        if (typeof window !== 'undefined') {
          const filtersJson = localStorage.getItem('propertyFilters');
          if (filtersJson) {
            const filters = JSON.parse(filtersJson);
            if (filters && (filters.currency === 'USD' || filters.currency === 'MXN')) {
              setSelectedCurrency(prev => {
                if (prev !== filters.currency) {
                  return filters.currency;
                }
                return prev;
              });
            }
          }
        }
      } catch (error) {
        console.error('Error reading currency from localStorage:', error);
      }
    };

    // Initial load
    loadCurrency();

    // Set up polling to detect changes
    const intervalId = setInterval(loadCurrency, 500);

    return () => clearInterval(intervalId);
  }, []);

  // Function to create lead in CRM pipeline
  const createLeadInPipeline = async (name: string) => {
    try {
      // Get current page URL as origin
      const originUrl = typeof window !== 'undefined' ? window.location.href : '';
      
      // Get UTM parameters if available
      const utmString = formatUtmParamsForUrl();
      
      // Prepare lead data
      const leadData = {
        propiedadId: propertyId, // This is correctly assigning the propertyId passed as prop to the propiedadId field
        propertyType: propertyType,
        condoName: condoName || '',
        transactionType: transactionType as 'renta' | 'venta' | 'ventaRenta',
        price: price,
        comision: 5, // Default commission
        estatus: "form" as const, // Initial status as "form"
        fechaCreacion: Timestamp.now(),
        origenTexto: "WhatsApp desde ficha de propiedad",
        origenUrl: originUrl,
        asesor: typeof window !== 'undefined' ? localStorage.getItem('userName') || 'SIN ASIGNAR' : 'SIN ASIGNAR',
        nombreCompleto: name,
        porcentajePizo: 50 // Default Pizo percentage
      };
      
      // Create the lead in Firebase
      const leadId = await createNegocio(leadData);
      console.log("Lead created successfully with ID:", leadId);
      
    } catch (error) {
      console.error("Error creating lead:", error);
      // Continue with WhatsApp message even if lead creation fails
    }
  };

  // Simple function to open WhatsApp with name
  const openWhatsAppWithName = async (name: string) => {
    // First create the lead in the pipeline
    await createLeadInPipeline(name);
    
    // Then continue with WhatsApp message
    // Handle different property types in the message
    let propertyTypeText = 'la propiedad';

    if (propertyType === 'casa') propertyTypeText = 'la casa';
    else if (propertyType === 'departamento' || propertyType === 'depa') propertyTypeText = 'el departamento';
    else if (propertyType === 'terreno') propertyTypeText = 'el terreno';
    else if (propertyType === 'local') propertyTypeText = 'el local comercial';

    // Get current page URL to include in message
    const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '';

    // Add UTM parameters if available
    const utmString = formatUtmParamsForUrl();
    const urlWithUtm = utmString ? `${currentUrl}?${utmString}` : currentUrl;

    // Include user's name in the message
    const message = `Hola, soy ${name} y me interesa ${propertyTypeText} ${transactionType === 'renta' ? 'en renta' : 'en venta'} ${condoName ? `en ${condoName}` : ''} ${zoneName ? `en ${zoneName}` : ''}\nRef: ${urlWithUtm}`;

    const whatsappUrl = `https://wa.me/${advisorPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Simple handler to show modal
  const handleWhatsAppClick = () => {
    setIsModalOpen(true);
    setUserName('');
    setNameError('');
    
    // Focus on input after modal opens
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name
    if (!userName.trim()) {
      setNameError('Por favor, introduce tu nombre');
      return;
    }
    
    // Close modal
    setIsModalOpen(false);
    
    // Call the updated function to create lead and open WhatsApp
    await openWhatsAppWithName(userName.trim());
  };
  
  // Handle click outside modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    }
    
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  // Format price based on currency and value
  const formatPrice = () => {
    const priceValue = selectedCurrency === 'USD' ? convertMXNtoUSD(price) : price;

    if (selectedCurrency === 'USD') {
      if (priceValue < 1000) {
        return `USD ${priceValue.toFixed(0)}`;
      } else if (priceValue < 1000000) {
        return `USD ${(priceValue / 1000).toFixed(priceValue % 1000 === 0 ? 0 : 1)}K`;
      } else {
        return `USD ${(priceValue / 1000000).toFixed(1)}M`;
      }
    } else {
      if (transactionType === 'renta') {
        return `$${priceValue.toLocaleString('es-MX')}`;
      } else if (priceValue < 1000000) {
        return `${(priceValue / 1000).toFixed(priceValue % 1000 === 0 ? 0 : 1)}K`;
      } else {
        return `${(priceValue / 1000000).toFixed(1)} MDP`;
      }
    }
  };

  // Simple modal component
  const NameModal = () => {
    if (!isModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div
          ref={modalRef}
          className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from bubbling
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">¿Cómo te llamas?</h3>
          <p className="text-sm text-gray-600 mb-4">Comparte tu nombre para que el asesor pueda atenderte mejor</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                ref={inputRef}
                type="text"
                placeholder="Tu nombre"
                value={userName}
                onChange={(e) => {
                  e.stopPropagation(); // Stop event propagation
                  setUserName(e.target.value);
                  if (e.target.value.trim()) setNameError('');
                }}
                className={`w-full px-4 py-2 rounded-lg border ${nameError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-violet-500`}
                autoFocus // Add autofocus
                onBlur={(e) => e.target.focus()} // Keep focus on blur
                autoComplete="off" // Disable autocomplete to prevent focus issues
              />
              {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800"
              >
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Inline variant: Simple button with text
  if (variant === 'inline') {
    return (
      <>
        <button
          onClick={handleWhatsAppClick}
          data-gtm-id="btn-whatsapp"
          className="w-full bg-black btn-whatsapp hover:bg-gradient-to-r from-violet-500 via-violet-600 to-violet-800 text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white transition-transform duration-300 hover:scale-110">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          <span className="text-white btn-whatsapp">Contactar por WhatsApp</span>
        </button>
        <NameModal />
      </>
    );
  }

  // Fixed variant: Mobile sticky footer with price
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-[0_-1px_12px_rgba(0,0,0,0.07)] px-4 py-3 z-50 md:hidden">
        <div className="flex items-center justify-between max-w-6xl mx-auto pb-3">
          {showPrice && (
            <div>
              <p className="text-gray-500 text-sm">
                {transactionType === 'renta' ? 'Renta' : 'Venta'}
              </p>
              <p className="text-xl font-semibold">
                {formatPrice()}
                {transactionType === 'renta' && selectedCurrency === 'MXN' && <span className="text-sm ml-1">/ mes</span>}
                {transactionType === 'renta' && selectedCurrency === 'USD' && <span className="text-sm ml-1">/ month</span>}
              </p>
            </div>
          )}

          <button
            onClick={handleWhatsAppClick}
            className={`flex items-center gap-2 bg-black text-white btn-whatsapp px-4 py-2 rounded-lg ${!showPrice ? 'w-full justify-center' : ''}`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span className="font-medium text-sm py-2 whitespace-nowrap">Contactar</span>
          </button>
        </div>
      </div>
      <NameModal />
    </>
  );
}