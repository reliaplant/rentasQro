'use client';

import { FC, useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

interface AdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    whatsappMessage: 'Hola, mi nombre es {name} y me gustaría recibir información.',
  },
  en: {
    contactInfo: 'Contact Information',
    fullName: 'Full Name',
    nameError: 'Name is required',
    emailError: 'Email is required',
    emailInvalidError: 'Please enter a valid email',
    startChat: 'Start WhatsApp Chat',
    whatsappMessage: 'Hi, my name is {name} and I would like to receive information.',
  },
  pt: {
    contactInfo: 'Informações de Contato',
    fullName: 'Nome Completo',
    nameError: 'Nome é obrigatório',
    emailError: 'Email é obrigatório',
    emailInvalidError: 'Digite um email válido',
    startChat: 'Iniciar Chat no WhatsApp',
    whatsappMessage: 'Olá, meu nome é {name} e gostaria de receber informações.',
  },
};

const AdvisorModal: FC<AdvisorModalProps> = ({ isOpen, onClose }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: '', email: '' });
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');

  const t = selectedLanguage ? translations[selectedLanguage as keyof typeof translations] : translations.es;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'name') validateName(value);
    if (name === 'email') validateEmail(value);
  };

  const handleWhatsAppClick = () => {
    const message = t.whatsappMessage.replace('{name}', formData.name);
    window.open(`https://wa.me/+529999999999?text=${encodeURIComponent(message)}`);
  };

  const isFormValid = !nameError && !emailError && formData.name && formData.email;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center">
        <div className="relative bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {!selectedLanguage ? (
            <>
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
            </>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-900 mb-5 text-center">
                {t.contactInfo}
              </h2>

              <div>
                <input
                  type="text"
                  name="name"
                  placeholder={t.fullName}
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={(e) => validateName(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    nameError ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
                />
                {nameError && (
                  <p className="mt-1 text-xs text-red-500">{nameError}</p>
                )}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={(e) => validateEmail(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    emailError ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
                />
                {emailError && (
                  <p className="mt-1 text-xs text-red-500">{emailError}</p>
                )}
              </div>

              <button
                onClick={handleWhatsAppClick}
                disabled={!isFormValid}
                className={`
                  w-full inline-flex items-center justify-center px-6 py-2.5 rounded-full transition-all
                  ${isFormValid 
                    ? 'bg-gray-900 hover:bg-gray-800 text-white cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                `}
              >
                <FaWhatsapp className="w-4 h-4 mr-2" />
                {t.startChat}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvisorModal;
