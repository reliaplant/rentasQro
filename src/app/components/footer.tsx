'use client';

import Link from 'next/link';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="mx-auto px-[5vw] py-6 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {/* Logo section */}
          <div className="col-span-2 md:col-span-1 space-y-3 md:space-y-4 mb-4 md:mb-0">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center">
                <img
                  src="/assets/logos/logoPizo.svg"
                  alt="Piso Logo"
                  className="h-6 md:h-8 w-auto hover:opacity-80"
                />
              </Link>
              <span className="text-lg md:text-xl font-semibold text-gray-900">pizo</span>
            </div>
            <p className="text-xs md:text-sm text-gray-500 max-w-xs">
              Encuentra la propiedad perfecta para rentar o comprar en Querétaro. 
              Las mejores opciones en departamentos, casas y más.
            </p>
            <div className="flex items-center space-x-4">
              {/* Social icons */}
                <a href="https://www.facebook.com/profile.php?id=61574693231863" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-violet-600">
                <FaFacebook size={16} className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              <a href="https://www.instagram.com/pizomx/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-violet-600">
                <FaInstagram size={16} className="w-4 h-4 md:w-5 md:h-5" />
              </a>
                <a href="https://wa.me/525537362098" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-violet-600">
                <FaWhatsapp size={16} className="w-4 h-4 md:w-5 md:h-5" />
                </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">Enlaces rápidos</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li>
                <Link href="/explorar" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Explorar propiedades
                </Link>
              </li>
              <li>
                <Link href="/casas/renta/queretaro" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Casas en renta Querétaro
                </Link>
              </li>
              <li>
                <Link href="/casas/venta/queretaro" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Casas en venta Querétaro
                </Link>
              </li>
              <li>
                <Link href="/casas/renta/zibata" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Renta en Zibatá
                </Link>
              </li>
              <li>
                <Link href="/casas/venta/zibata" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Venta en Zibatá
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/legal/programa-referidos" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Programa de Referidos
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  Asesores
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">Contacto</h3>
            <ul className="space-y-1.5 md:space-y-3">
              <li className="flex items-start">
                <FaEnvelope className="mt-0.5 mr-2 text-gray-400 w-3 h-3 md:w-4 md:h-4"/>
                <a href="mailto:info@pizo.mx" className="text-xs md:text-sm text-gray-500 hover:text-violet-600">
                  info@pizo.mx
                </a>
              </li>

            </ul>
          </div>

          {/* Schedule */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-xs md:text-sm font-semibold text-gray-900 uppercase tracking-wider">Horario de atención</h3>
            <ul className="space-y-1.5 md:space-y-2">
              <li className="text-xs md:text-sm text-gray-500">Lunes a Viernes: 9:00 - 18:00</li>
              <li className="text-xs md:text-sm text-gray-500">Sábados: 9:00 - 13:00</li>
              <li className="text-xs md:text-sm text-gray-500">Domingos: Cerrado</li>
            </ul>
          </div>
        </div>

        {/* Legal and copyright */}
        <div className="pt-6 mt-6 md:pt-8 md:mt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs md:text-sm text-gray-400">
              &copy; {currentYear} Pizo. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 md:space-x-6 mt-3 md:mt-0">
              <Link href="/legal/privacidad" className="text-xs md:text-sm text-gray-400 hover:text-violet-600">
                Aviso de Privacidad
              </Link>
              <Link href="/legal/tyc" className="text-xs md:text-sm text-gray-400 hover:text-violet-600">
                Términos y Condiciones
              </Link>
              <Link href="/legal/politica-cookies" className="text-xs md:text-sm text-gray-400 hover:text-violet-600">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
