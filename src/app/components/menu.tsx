"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useFavorites } from '@/app/hooks/useFavorites';
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
    <div style={{ zIndex: 10000 }}>
      {isPropertyListingModalOpen && (
        <PropertyListingModal
          isOpen={isPropertyListingModalOpen}
          onClose={closePropertyListingModal}
        />
      )}
    </div>
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
  const router = useRouter();

  // Add state for tracking menu visibility on scroll
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [isAtPageTop, setIsAtPageTop] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Check if we're on mobile view on mount and on window resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobileView(window.innerWidth < 768); // 768px is the md breakpoint in Tailwind
    };
    
    // Initial check
    checkIsMobile();
    
    // Listen for resize events
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
  // Handle scroll events for hiding/showing the navbar - only on mobile
  useEffect(() => {
    const handleScroll = () => {
      // Skip scroll handling on desktop
      if (!isMobileView) {
        setIsNavVisible(true);
        return;
      }
      
      const currentScrollY = window.scrollY;
      
      // Check if we're at the top of the page
      const atTop = currentScrollY < 10;
      setIsAtPageTop(atTop);
      
      // Always show navbar when at the top of the page
      if (atTop) {
        setIsNavVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Determine scroll direction
      const isScrollingDown = currentScrollY > lastScrollY;
      setIsScrollingUp(!isScrollingDown);
      
      // Add some threshold to avoid flickering
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);
      if (scrollDifference > 5) {
        // Hide on scroll down, show on scroll up - ONLY on mobile
        setIsNavVisible(!isScrollingDown);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY, isMobileView]); // Added isMobileView as dependency

  // Handle mobile menu close when nav hides
  useEffect(() => {
    if (!isNavVisible) {
      setIsMobileMenuOpen(false);
    }
  }, [isNavVisible]);

  // Create memoized callbacks for modal handlers
  const openPropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(true), []);
  const closePropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(false), []);

  // Memoized handler for advisor modal
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const openAdvisorModal = useCallback(() => setIsAdvisorModalOpen(true), []);
  const closeAdvisorModal = useCallback(() => setIsAdvisorModalOpen(false), []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Remove the effect that causes the loop
  // Instead, use a ref to track first render
  const initialRenderRef = useRef(true);
  useEffect(() => {
    if (initialRenderRef.current) {
      const transactionParam = searchParams?.get('t');
      if ((transactionParam === 'renta' || transactionParam === 'compra')) {
        console.log(`Menu: Initial transaction type from URL (no filter update): ${transactionParam}`);
        // No filter update logic here
      }
      initialRenderRef.current = false;
    }
  }, [searchParams]);

  // Simplified handlers with direct navigation - no need for preventDefault
  const handleRentClick = useCallback(() => {
    console.log('Menu: Navigating to Renta page');
    setIsMobileMenuOpen(false);
    // Use replace instead of push for a cleaner navigation experience
    router.replace('/explorar?t=renta&preventa=false');
  }, [router]);

  const handleBuyClick = useCallback(() => {
    console.log('Menu: Navigating to Compra page');
    setIsMobileMenuOpen(false);
    router.replace('/explorar?t=compra&preventa=false');
  }, [router]);

  const handlePreventaClick = useCallback(() => {
    console.log('Menu: Navigating to Preventa page');
    setIsMobileMenuOpen(false);
    router.replace('/explorar?t=compra&preventa=true');
  }, [router]);

  // Update isActive function to rely solely on URL parameters
  const isActive = useCallback((path: string) => {
    const urlTransactionType = searchParams?.get('t');
    const urlPreventa = searchParams?.get('preventa') === 'true'; // Ensure boolean comparison
    
    if (path === '/' && pathname === '/') return true;

    if (path === '/preventa') {
      return pathname === '/explorar' && urlPreventa && urlTransactionType === 'compra';
    }

    if (path === '/rentar') {
      return pathname === '/explorar' && !urlPreventa && urlTransactionType === 'renta';
    }
    
    if (path === '/comprar') {
      return pathname === '/explorar' && !urlPreventa && urlTransactionType === 'compra';
    }

    // For other paths, just check if the pathname starts with the path
    if (path !== '/' && pathname?.startsWith(path)) return true;
    
    return false;
  }, [pathname, searchParams]);

  // Make sure the tab click handler directly uses router without custom logic
  const handleTabClick = useCallback((url: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Menu: Navigating to', url);
    setIsMobileMenuOpen(false);
    router.push(url);
  }, [router]);

  return (
    <>
      <nav className={`
        bg-white shadow-sm fixed top-0 left-0 right-0 z-[9999]
        transition-transform duration-300 ease-in-out
        ${!isNavVisible && isMobileView ? '-translate-y-full' : 'translate-y-0'}
        ${isAtPageTop ? 'shadow-none' : 'shadow-md'}
      `}>
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
                href="/explorar?t=compra&preventa=false" // Updated href
                onClick={(e) => handleTabClick('/explorar?t=compra&preventa=false', e)}
                className={`whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer ${
                  isActive('/comprar') 
                    ? 'border-violet-800 text-violet-800' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Comprar
              </Link>
              <Link
                href="/explorar?t=renta&preventa=false" // Updated href
                onClick={(e) => handleTabClick('/explorar?t=renta&preventa=false', e)}
                className={`whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer ${
                  isActive('/rentar') 
                    ? 'border-violet-800 text-violet-800' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rentar
              </Link>

              <Link
                href="/explorar?t=compra&preventa=true" // Updated href
                onClick={(e) => handleTabClick('/explorar?t=compra&preventa=true', e)}
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
                  // No filter update logic
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
                  // No filter update logic
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
                // No filter update logic
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
              onClick={openPropertyListingModal}
              className="text-sm font-medium text-gray-700 hover:text-violet-800 cursor-pointer"
            >
              Publica tu propiedad
            </button>
            <button 
              onClick={openAdvisorModal}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-800 to-violet-700 rounded-lg hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow cursor-pointer"
            >
              ¿Necesitas un asesor?
            </button>
          </div>
        </div>

        {/* Use the extracted modal component */}
        <MenuModals
          isPropertyListingModalOpen={isPropertyListingModalOpen}
          closePropertyListingModal={closePropertyListingModal}
        />
      </nav>

      {/* Add a spacer div that's the same height as the menu but only on desktop */}
      <div className="hidden md:block h-16"></div>

      {/* Mobile menu moved outside the nav element so it's independent */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden bg-white border-t border-gray-100 shadow-lg fixed inset-0 z-[9990] overflow-y-auto"
          style={{ 
            top: '64px',
            height: 'calc(100vh - 64px)'
          }}
        >
          <div className="p-4 space-y-3">
            <Link
              href="/explorar"
              onClick={(e) => handleTabClick('/explorar', e)}
              className="flex items-center px-4 py-3 rounded-lg text-base font-medium bg-violet-600 text-white hover:bg-violet-700"
            >
              Explorar
            </Link>
            <Link
              href="/explorar?t=compra&preventa=false" // Updated href
              onClick={(e) => handleTabClick('/explorar?t=compra&preventa=false', e)}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium 
                ${isActive('/comprar')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              Comprar
            </Link>
            <Link
              href="/explorar?t=renta&preventa=false" // Updated href
              onClick={(e) => handleTabClick('/explorar?t=renta&preventa=false', e)}
              className={`flex items-center px-4 py-3 rounded-lg text-base font-medium 
                ${isActive('/rentar')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              Rentar
            </Link>

            <Link
              href="/explorar?t=compra&preventa=true" // Updated href
              onClick={(e) => handleTabClick('/explorar?t=compra&preventa=true', e)}
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
                // No filter update logic
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
                // No filter update logic
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
                // No filter update logic
              }}
              className="flex w-full items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50"
            >
              Publica tu propiedad
            </button>

            <AdvisorModal />

          </div>
        </div>
      )}

      {/* Render modals at the root level */}
      {isPropertyListingModalOpen && (
        <PropertyListingModal
          isOpen={isPropertyListingModalOpen}
          onClose={closePropertyListingModal}
        />
      )}
      
      {isAdvisorModalOpen && (
        <AdvisorModal 
          isOpen={isAdvisorModalOpen}
          onClose={closeAdvisorModal}
        />
      )}
    </>
  );
}