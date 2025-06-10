'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaWhatsapp } from 'react-icons/fa';
import { BiUser, BiBuildings } from 'react-icons/bi';

interface PropertyListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserType = 'advisor' | 'owner' | null;

// WhatsApp configuration
const WHATSAPP_NUMBER = '++525537362098'; 
const MESSAGE = 'Hola, me gustaría publicar una propiedad que tengo.';

export default function PropertyListingModal({ isOpen, onClose }: PropertyListingModalProps) {
  // Form state
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Validation state
  const [fullNameError, setFullNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Reset the form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setUserType(null);
      setFullName('');
      setPhone('');
      setEmail('');
      setFullNameError('');
      setPhoneError('');
      setEmailError('');
    }
  }, [isOpen]);
  
  // Don't render anything if modal is closed
  if (!isOpen) return null;
  
  // Full Name validation
  function validateFullName(value: string): boolean {
    if (!value.trim()) {
      setFullNameError('El nombre es requerido');
      return false;
    }
    
    if (value.trim().length < 3) {
      setFullNameError('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    
    setFullNameError('');
    return true;
  }
  
  // Phone validation
  function validatePhone(value: string): boolean {
    const mexicanPhoneRegex = /^(?:\+?52)?[1-9]\d{9}$/;
    const cleanPhone = value.replace(/\D/g, '');
    
    if (!cleanPhone) {
      setPhoneError('El teléfono es requerido');
      return false;
    }
    
    if (!mexicanPhoneRegex.test(cleanPhone)) {
      setPhoneError('Ingresa un número de teléfono válido de México');
      return false;
    }
    
    setPhoneError('');
    return true;
  }
  
  // Email validation
  function validateEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value) {
      setEmailError('El correo es requerido');
      return false;
    }
    
    if (!emailRegex.test(value)) {
      setEmailError('Ingresa un correo electrónico válido');
      return false;
    }
    
    setEmailError('');
    return true;
  }
  
  // Form validation
  const isFormValid = () => {
    return userType && !fullNameError && !phoneError && !emailError && fullName && phone && email;
  };
  
  // Handle user type selection
  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setStep(2);
  };
  
  // Go back to first step
  const handleBackToUserType = () => {
    setStep(1);
    setUserType(null);
  };
  
  // Handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (!isFormValid()) return;
    
    const userTypeText = userType === 'advisor' ? 'Asesor Inmobiliario' : 'Dueño de propiedad';
    const message = `${MESSAGE}\nTipo: ${userTypeText}\nNombre: ${fullName}\nTeléfono: ${phone}\nCorreo: ${email}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-sm cursor-pointer" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-xl w-[28rem] p-6">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>
          
          {/* Modal content */}
          <div className="min-h-[20rem] flex flex-col justify-center">
            {step === 1 ? (
              /* Step 1: User Type Selection */
              <>
                <h2 className="text-lg font-medium text-gray-900 mb-6 text-center">
                  ¿Eres asesor inmobiliario o dueño de la propiedad?
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleUserTypeSelect('advisor')}
                    className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-violet-500 transition-all hover:bg-violet-50/50 group cursor-pointer"
                  >
                    <BiUser className="text-4xl mb-2 text-gray-400 group-hover:text-violet-600 group-hover:scale-110 transition-all" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-violet-700">
                      Asesor Inmobiliario
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserTypeSelect('owner')}
                    className="flex flex-col items-center p-4 rounded-xl border-2 border-gray-200 hover:border-violet-500 transition-all hover:bg-violet-50/50 group cursor-pointer"
                  >
                    <BiBuildings className="text-4xl mb-2 text-gray-400 group-hover:text-violet-600 group-hover:scale-110 transition-all" />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-violet-700">
                      Dueño de Propiedad
                    </span>
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: Contact Information */
              <>
                <h2 className="text-lg font-medium text-gray-900 mb-5 text-center">
                  Datos de contacto
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        validateFullName(e.target.value);
                      }}
                      onBlur={(e) => validateFullName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        fullNameError ? 'border-red-300' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
                    />
                    {fullNameError && (
                      <p className="mt-1 text-xs text-red-500">{fullNameError}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="tel"
                      placeholder="Teléfono"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        validatePhone(e.target.value);
                      }}
                      onBlur={(e) => validatePhone(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        phoneError ? 'border-red-300' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
                    />
                    {phoneError && (
                      <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                      }}
                      onBlur={(e) => validateEmail(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        emailError ? 'border-red-300' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all`}
                    />
                    {emailError && (
                      <p className="mt-1 text-xs text-red-500">{emailError}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleWhatsAppClick}
                      disabled={!isFormValid()}
                      className={`
                        inline-flex items-center px-6 py-2.5 text-sm font-medium text-white rounded-lg transition-all
                        ${isFormValid()
                          ? 'bg-gray-900 hover:bg-gray-800 cursor-pointer' 
                          : 'bg-gray-300 cursor-not-allowed'}
                      `}
                    >
                      <FaWhatsapp className="w-4 h-4 mr-2" />
                      Iniciar chat por WhatsApp
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleBackToUserType}
                      className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Cambiar tipo de usuario
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
