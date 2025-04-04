'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto px-[5vw] py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <img
                  src="/assets/logos/logoPizo.svg"
                  alt="Piso Logo"
                  className="h-8 w-auto hover:opacity-80"
                />
              </Link>
              <span className="text-xl font-semibold text-gray-900">pizo</span>
            </div>
            <p className="text-gray-500 max-w-xs">
              Encuentra la propiedad perfecta para rentar o comprar en Querétaro. 
              Las mejores opciones en departamentos, casas y más.
            </p>
            <div className="flex items-center space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-violet-600">
                <FaFacebook size={20} />
              </a>
                <a href="https://www.instagram.com/pizomx/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-violet-600">
                <FaInstagram size={20} />
                </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-violet-600">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explorar" className="text-gray-500 hover:text-violet-600">
                  Explorar propiedades
                </Link>
              </li>
             

              <li>
                <Link href="/contacto" className="text-gray-500 hover:text-violet-600">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-500 hover:text-violet-600">
                  Asesores
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-3">
                <li className="flex items-start">
                <FaPhone className="mt-1 mr-3 text-gray-400"/>
                <a href="tel:4421234567" className="text-gray-500 hover:text-violet-600">
                  (442) 123-4567
                </a>
                </li>
                <li className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 text-gray-400"/>
                <a href="mailto:info@pizo.mx" className="text-gray-500 hover:text-violet-600">
                  info@pizo.mx
                </a>
                </li>
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-gray-400"/>
                <span className="text-gray-500">Blvd. Bernardo Quintana 555, Querétaro, Qro.</span>
              </li>
            </ul>
          </div>

          {/* Horario */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Horario de atención</h3>
            <ul className="space-y-2">
              <li className="text-gray-500">Lunes a Viernes: 9:00 - 18:00</li>
              <li className="text-gray-500">Sábados: 9:00 - 13:00</li>
              <li className="text-gray-500">Domingos: Cerrado</li>
            </ul>
          </div>
        </div>

        {/* Legales y copyright */}
        <div className="pt-8 mt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {currentYear} Pizo. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/legal/privacidad" className="text-sm text-gray-400 hover:text-violet-600">
                Aviso de Privacidad
              </Link>
              <Link href="/legal/tyc" className="text-sm text-gray-400 hover:text-violet-600">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
