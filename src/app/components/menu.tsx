"use client";

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useFilters } from '../context/FilterContext';
import AdvisorModal from '../components/AdvisorModal';
import PropertyListingModal from './PropertyListingModal';

// Create a separate component for modals to avoid rendering issues
function MenuModals({
  isPropertyListingModalOpen,
  closePropertyListingModal
}: {
  isPropertyListingModalOpen: boolean;
  closePropertyListingModal: () => void;
}) {
  return (
    <>
      {isPropertyListingModalOpen && (
        <PropertyListingModal
          isOpen={isPropertyListingModalOpen}
          onClose={closePropertyListingModal}
        />
      )}
    </>
  );
}

export default function Menu() {
  const pathname = usePathname();

  // Stop rendering early if on admin or advisor pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/asesor')) {
    return null;
  }

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPropertyListingModalOpen, setIsPropertyListingModalOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();
  const { filters, updateFilter } = useFilters();
  
  const router = useRouter();
  const currentTransactionType = filters.transactionType;

  // Create memoized callbacks for modal handlers
  const openPropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(true), []);
  const closePropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(false), []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    
    // Special handling for rentar/comprar links using filter context
    if (path === '/rentar') return pathname === '/explorar' && currentTransactionType === 'renta';
    if (path === '/comprar') return pathname === '/explorar' && currentTransactionType === 'compra';
    
    // Normal path checking for other links
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const handleRentClick = () => {
    updateFilter('transactionType', 'renta');
    setIsMobileMenuOpen(false);
  };

  const handleBuyClick = () => {
    updateFilter('transactionType', 'compra');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white z-[9999] shadow-sm sticky top-0">
      <div className="px-4 md:px-[5vw] flex flex-row items-center justify-between h-16">
        {/* Left side with logo and navigation */}
        <div className="flex flex-row gap-2 md:gap-5 items-center">
          <div className="cursor-pointer">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/logos/logoPizo.svg"
                alt="Rentas Queretaro Logo"
                className="h-7 md:h-8 w-auto hover:opacity-80"
              />
            </Link>
          </div>
          <div className="block">
            <Link href="/">
              <span className='font-semibold text-xl md:text-2xl mr-4 md:mr-12 cursor-pointer !text-black'>pizo</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex -mb-px space-x-8">
            <Link
              href="/explorar"
              onClick={handleRentClick}
              className={`${
                isActive('/rentar')
                  ? 'border-violet-800 text-violet-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Rentar
            </Link>
            <Link
              href="/explorar"
              onClick={handleBuyClick}
              className={`${
                isActive('/comprar')
                  ? 'border-violet-800 text-violet-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Comprar
            </Link>
            <Link
              href="/preventa"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${
                isActive('/preventa')
                  ? 'border-violet-800 text-violet-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Preventa
            </Link>
            <Link
              href="/qro/zibata"
              className={`${
              pathname?.startsWith('/qro/zibata')
                ? 'border-violet-800 text-violet-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Zibatá
            </Link>
          </nav>
        </div>

        {/* Mobile menu toggle button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>

        {/* Right side - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/favoritos"
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full transition-colors relative ${
              favorites.length > 0 
              ? 'text-violet-800 bg-violet-50 hover:bg-violet-100'
              : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <FaHeart className={`w-3.5 h-3.5 mr-2 ${
              favorites.length > 0 ? 'text-red-500' : 'text-gray-400'
            }`} />
            Favoritos
            {favorites.length > 0 && (
              <span className="ml-1 bg-violet-200 text-violet-900 px-1.5 py-0.5 rounded-full text-xs min-w-[20px] text-center">
                {favorites.length}
              </span>
            )}
          </Link>
          <button
            onClick={openPropertyListingModal}
            className="text-sm font-medium text-gray-700 hover:text-violet-800 cursor-pointer"
          >
            Publica tu propiedad
          </button>
          <AdvisorModal />
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden bg-white border-t border-gray-100 shadow-lg fixed inset-0 top-16 z-30 overflow-y-auto"
        >
          <div className="p-4 space-y-3">
            <Link
              href="/explorar"
              onClick={handleRentClick}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                currentTransactionType === 'renta' 
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Rentar
            </Link>
            <Link
              href="/explorar"
              onClick={handleBuyClick}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                currentTransactionType === 'compra'
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Comprar
            </Link>
            <Link
              href="/preventa"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                pathname?.startsWith('/preventa') 
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Preventa
            </Link>
            <Link
              href="/qro/zibata"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${
                pathname?.startsWith('/qro/zibata') 
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Zibatá
            </Link>
            <div className="border-t border-gray-200 my-3"></div>
            <Link
              href="/favoritos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaHeart className={`w-4 h-4 mr-3 ${
                favorites.length > 0 ? 'text-red-500' : 'text-gray-400'
              }`} />
              Favoritos
              {favorites.length > 0 && (
                <span className="ml-2 bg-violet-200 text-violet-900 px-2 py-0.5 rounded-full text-xs min-w-[20px] text-center">
                {favorites.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => {
                openPropertyListingModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Publica tu propiedad
            </button>
            
            <AdvisorModal />

          </div>
        </div>
      )}
      
      {/* Use the extracted modal component */}
      <MenuModals 
        isPropertyListingModalOpen={isPropertyListingModalOpen}
        closePropertyListingModal={closePropertyListingModal}
      />
    </nav>
  );
}