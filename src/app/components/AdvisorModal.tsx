'use client';

import { FC, useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';
import { IconType } from 'react-icons';
import * as Icons from 'react-icons/fa';

interface AdvisorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  page?: string;
  rounded?: 'lg' | 'full';
  backgroundColor?: string;
  textColor?: string;
  showIcon?: boolean;
  iconName?: string;
  buttonText?: string; // Nueva prop
  iconPosition?: 'left' | 'right'; // Nueva prop
}

interface FormData {
  name: string;
  email: string;
}

const translations = {
  es: {
    contactInfo: 'Información de contacto',
    fullName: 'Nombre completo',
    nameError: 'El nombre es requerido',
    emailError: 'El correo es requerido',
    emailInvalidError: 'Ingresa un correo electrónico válido',
    startChat: 'Iniciar chat por WhatsApp',
    whatsappMessage: 'Hola, necesito ayuda para encontrar una propiedad.',
    needAdvisor: '¿Necesitas un asesor?',
  },
  en: {
    contactInfo: 'Contact Information',
    fullName: 'Full Name',
    nameError: 'Name is required',
    emailError: 'Email is required',
    emailInvalidError: 'Please enter a valid email',
    startChat: 'Start WhatsApp Chat',
    whatsappMessage: 'Hello, I need help finding a property.',
    needAdvisor: 'Need an advisor?',
  },
  pt: {
    contactInfo: 'Informações de Contato',
    fullName: 'Nome Completo',
    nameError: 'Nome é obrigatório',
    emailError: 'Email é obrigatório',
    emailInvalidError: 'Digite um email válido',
    startChat: 'Iniciar Chat no WhatsApp',
    whatsappMessage: 'Olá, preciso de ajuda para encontrar uma propriedade.',
    needAdvisor: 'Precisa de um consultor?',
  },
};

// Update WhatsApp number
const WHATSAPP_NUMBER = '++525537362098';

const AdvisorModal: FC<AdvisorModalProps> = ({ 
  isOpen: externalIsOpen, 
  onClose: externalOnClose,
  page = 'default',
  rounded = 'lg',
  backgroundColor = 'bg-gradient-to-r from-violet-800 to-violet-700',
  textColor = 'text-white',
  showIcon = true,
  iconName,
  buttonText = translations.es.needAdvisor, // Valor por defecto
  iconPosition = 'left', // Valor por defecto
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const isControlledExternally = externalIsOpen !== undefined && externalOnClose !== undefined;
  const isOpen = isControlledExternally ? externalIsOpen : internalIsOpen;
  
  const handleOpen = () => {
    if (!isControlledExternally) {
      setInternalIsOpen(true);
    }
  };
  
  const handleClose = () => {
    if (isControlledExternally) {
      externalOnClose?.();
    } else {
      setInternalIsOpen(false);
    }
  };

  const t = selectedLanguage ? translations[selectedLanguage as keyof typeof translations] : translations.es;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [externalOnClose]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedLanguage(null);
      setFormData({ name: '', email: '' });
      setNameError('');
      setEmailError('');
    }
  }, [isOpen]);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError(t.nameError);
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!value) {
      setEmailError(t.emailError);
      return false;
    }

    if (!emailRegex.test(value)) {
      setEmailError(t.emailInvalidError);
      return false;
    }

    setEmailError('');
    return true;
  };

  const handleLanguageSelect = (lang: string) => {
    setSelectedLanguage(lang);
    
    // Get translated message for selected language
    const langTranslations = translations[lang as keyof typeof translations];
    
    // Use the direct message without name replacement
    const message = langTranslations.whatsappMessage;
    
    // Immediately redirect to WhatsApp
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
    
    // Close the modal
    handleClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name') validateName(value);
    if (name === 'email') validateEmail(value);
  };

  const getWhatsAppMessage = () => {
    const baseMessage = t.whatsappMessage.replace('{name}', formData.name);
    return `${baseMessage} (${page})`;
  };

  const handleWhatsAppClick = () => {
    const message = getWhatsAppMessage();
    window.open(`https://wa.me/+524421598602?text=${encodeURIComponent(message)}`);
    handleClose();
  };

  const isFormValid = !nameError && !emailError && formData.name && formData.email;

  // Modificamos la lógica del icono para que solo se muestre si se proporciona iconName
  const IconComponent = iconName && showIcon ? (Icons as Record<string, IconType>)[iconName] : null;

  return (
    <>
      {!isControlledExternally && (
        <button
          onClick={handleOpen}
          className={`inline-flex items-center px-4 py-2 text-sm font-medium ${textColor} ${backgroundColor} rounded-${rounded} hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow cursor-pointer`}
        >
          {IconComponent && iconPosition === 'left' && (
            <IconComponent className="w-4 h-4 mr-2" />
          )}
          {buttonText}
          {IconComponent && iconPosition === 'right' && (
            <IconComponent className="w-4 h-4 ml-2" />
          )}
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/30" onClick={handleClose} />

          <div className="fixed inset-0 flex items-center justify-center ">
            <div className="relative bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              {/* Only showing language selection, form step will be skipped */}
              <h3 className="text-lg font-medium mb-2 text-center">
                Selecciona tu idioma
              </h3>
              <p className="text-xs text-gray-500 text-center mb-4">
                Select your language
              </p>
              <div className="flex justify-around gap-4">
                <button
                  onClick={() => handleLanguageSelect('es')}
                  className="w-[120px] flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer hover:outline hover:outline-2 hover:outline-violet-500 transition-all border-2 border-gray-100"
                >
                  <span className="text-2xl">🇲🇽</span>
                  <span className="mt-2 text-sm">Español</span>
                </button>
                <button
                  onClick={() => handleLanguageSelect('en')}
                  className="w-[120px] flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer hover:outline hover:outline-2 hover:outline-violet-500 transition-all border-2 border-gray-100"
                >
                  <span className="text-2xl">🇺🇸</span>
                  <span className="mt-2 text-sm">English</span>
                </button>
                <button
                  onClick={() => handleLanguageSelect('pt')}
                  className="w-[120px] flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg cursor-pointer hover:outline hover:outline-2 hover:outline-violet-500 transition-all border-2 border-gray-100"
                >
                  <span className="text-2xl">🇧🇷</span>
                  <span className="mt-2 text-sm">Português</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvisorModal;