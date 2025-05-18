"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
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

// This component only renders on the client
export default function Menu() {
  // Get the current pathname and search params using Next.js router
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Stop rendering early if on admin or advisor pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/asesor')) {
    return null;
  }
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPropertyListingModalOpen, setIsPropertyListingModalOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();
  const { filters, updateFilter, resetFilters } = useFilters();

  const router = useRouter();
  const currentTransactionType = filters.transactionType;

  // Create memoized callbacks for modal handlers
  const openPropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(true), []);
  const closePropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(false), []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Remove the effect that causes the loop
  // Instead, use a ref to track first render
  const initialRenderRef = useRef(true);
  useEffect(() => {
    if (initialRenderRef.current) {
      const transactionParam = searchParams?.get('t');
      if ((transactionParam === 'renta' || transactionParam === 'compra') && 
          transactionParam !== currentTransactionType) {
        console.log(`Menu: Initial sync to URL param: ${transactionParam}`);
        updateFilter('transactionType', transactionParam);
      }
      initialRenderRef.current = false;
    }
  }, [searchParams, currentTransactionType, updateFilter]);

  // Simplified handlers that don't cause loops
  const handleRentClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Menu: Setting transaction type to renta and clearing filters');
    
    // Reset all filters first
    resetFilters(); 
    
    // Then set only the transaction type
    updateFilter('transactionType', 'renta');
    // Explicitly ensure preventa is false for renta
    updateFilter('preventa', false);
    
    setIsMobileMenuOpen(false);
    router.push('/explorar?t=renta');
  }, [updateFilter, router, resetFilters]);

  const handleBuyClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Menu: Setting transaction type to compra and clearing filters');
    
    // Reset all filters first
    resetFilters();
    
    // Then set only the transaction type, explicitly ensure preventa is false
    updateFilter('transactionType', 'compra');
    updateFilter('preventa', false); // Explicitly ensure preventa is false
    
    setIsMobileMenuOpen(false);
    router.push('/explorar?t=compra');
  }, [updateFilter, router, resetFilters]);

  // Handler for Preventa click - updated to handle the boolean preventa flag
  const handlePreventaClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Menu: Setting preventa filter to true and transaction to compra');
    
    // Reset all filters first
    resetFilters(); 
    
    // Then set only what we need - this should be done with a custom filter for preventa
    updateFilter('transactionType', 'compra');
    updateFilter('preventa', true);
    
    setIsMobileMenuOpen(false);
    router.push('/explorar?preventa=true&t=compra');
  }, [updateFilter, router, resetFilters]);

  // Update isActive function to properly check for the preventa flag
  const isActive = useCallback((path: string) => {
    // Get URL parameter directly to avoid dependency on state
    const urlTransactionType = searchParams?.get('t');
    const urlPreventa = searchParams?.get('preventa');
    
    if (path === '/' && pathname === '/') return true;

    // For Preventa link, only consider it active when preventa is true
    if (path === '/preventa') {
      return pathname === '/explorar' && 
             ((urlPreventa === 'true') || 
             (filters.preventa === true));
    }

    // For rent/buy links, check if we're not in preventa mode
    const isPreventaActive = urlPreventa === 'true' || filters.preventa === true;

    // For Rent Tab - don't show as active if preventa is active
    if (path === '/rentar') {
      return pathname === '/explorar' && 
             !isPreventaActive &&
             ((urlTransactionType === 'renta') || 
             (!urlTransactionType && filters.transactionType === 'renta'));
    }
    
    // For Buy Tab - don't show as active if preventa is active
    if (path === '/comprar') {
      return pathname === '/explorar' && 
             !isPreventaActive &&
             ((urlTransactionType === 'compra') || 
             (!urlTransactionType && filters.transactionType === 'compra'));
    }

    if (path !== '/' && pathname?.startsWith(path)) return true;
    
    return false;
  }, [pathname, searchParams, filters.transactionType, filters.preventa]);

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

          {/* Mobile Explorar button - always visible */}
          <Link
            href="/explorar"
            className="md:hidden flex items-center px-4 py-2 rounded-full text-sm font-semibold 
            bg-gradient-to-r from-violet-600 to-indigo-600 text-white 
            shadow-lg shadow-violet-200 
            active:scale-95 transform transition-all
            hover:from-violet-700 hover:to-indigo-700"
          >
            Explorar
          </Link>

          {/* Desktop Navigation with improved styling approach */}
          <nav className="hidden md:flex -mb-px space-x-8">
            <Link
              href="/explorar?t=compra"
              onClick={handleBuyClick}
              className={`whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer ${
                isActive('/comprar') 
                  ? 'border-violet-800 text-violet-800' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comprar
            </Link>
            <Link
              href="/explorar?t=renta"
              onClick={handleRentClick}
              className={`whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer ${
                isActive('/rentar') 
                  ? 'border-violet-800 text-violet-800' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rentar
            </Link>

            <Link
              href="/explorar?preventa=true&t=compra"
              onClick={handlePreventaClick}
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
              onClick={() => {
                // Clear preventa filter when navigating away
                updateFilter('propertyType', '');
              }}
              className={`${pathname?.startsWith('/qro/zibata')
                  ? 'border-violet-800 text-violet-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Zibatá
            </Link>
            <Link
              href="/blog"
              onClick={() => {
                // Clear preventa filter when navigating away
                updateFilter('propertyType', '');
              }}
              className={`${pathname?.startsWith('/blog')
                  ? 'border-violet-800 text-violet-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Blog
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
            onClick={() => {
              // Clear preventa filter when navigating away
              updateFilter('propertyType', '');
            }}
            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full transition-colors relative ${favorites.length > 0
                ? 'text-violet-800 bg-violet-50 hover:bg-violet-100'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
              }`}
          >
            <FaHeart className={`w-3.5 h-3.5 mr-2 ${favorites.length > 0 ? 'text-red-500' : 'text-gray-400'
              }`} />
            Favoritos
            {favorites.length > 0 && (
              <span className="ml-1 bg-violet-200 text-violet-900 px-1.5 py-0.5 rounded-full text-xs min-w-[20px] text-center">
                {favorites.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              openPropertyListingModal();
              // Clear preventa filter when using modal
              updateFilter('propertyType', '');
            }}
            className="text-sm font-medium text-gray-700 hover:text-violet-800 cursor-pointer"
          >
            Publica tu propiedad
          </button>
          <AdvisorModal />
        </div>
      </div>

      {/* Mobile menu with same isActive logic */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white border-t border-gray-100 shadow-lg fixed inset-0 top-16 z-30 overflow-y-auto"
        >
          <div className="p-4 space-y-3">
            <Link
              href="/explorar"
              onClick={() => {
                setIsMobileMenuOpen(false);
                resetFilters(); // Reset all filters when clicking "Explorar"
              }}
              className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-violet-600 text-white hover:bg-violet-700"
            >
              Explorar
            </Link>
            <Link
              href="/explorar?t=compra"
              onClick={handleBuyClick}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium 
                ${isActive('/comprar')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              Comprar
            </Link>
            <Link
              href="/explorar?t=renta"
              onClick={handleRentClick}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium 
                ${isActive('/rentar')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              Rentar
            </Link>

            <Link
              href="/explorar?preventa=true&t=compra"
              onClick={handlePreventaClick}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${isActive('/preventa')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              Preventa
            </Link>
            <Link
              href="/qro/zibata"
              onClick={() => {
                setIsMobileMenuOpen(false);
                // Clear preventa filter when navigating away
                updateFilter('propertyType', '');
              }}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium ${pathname?.startsWith('/qro/zibata')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              Zibatá
            </Link>
            <div className="border-t border-gray-200 my-3"></div>
            <Link
              href="/favoritos"
              onClick={() => {
                setIsMobileMenuOpen(false);
                // Clear preventa filter when navigating away
                updateFilter('propertyType', '');
              }}
              className="flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              <FaHeart className={`w-4 h-4 mr-3 ${favorites.length > 0 ? 'text-red-500' : 'text-gray-400'
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
                // Clear preventa filter when using modal
                updateFilter('propertyType', '');
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