"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  getCurrentUser, 
  signOut, 
  onAuthStateChange, 
  checkIfUserIsAdmin, 
  checkIfUserIsAdvisor 
} from '@/app/shared/firebase';
import type { User } from 'firebase/auth';
import { FaHeart } from 'react-icons/fa';
import { useFavorites } from '@/app/hooks/useFavorites';
import { useFilters } from '../context/FilterContext';
import AdvisorModal from '../components/AdvisorModal';
import PropertyListingModal from './PropertyListingModal';

// Create a separate component for modals to avoid rendering issues
function MenuModals({
  isAdvisorModalOpen,
  closeAdvisorModal,
  isPropertyListingModalOpen,
  closePropertyListingModal
}: {
  isAdvisorModalOpen: boolean;
  closeAdvisorModal: () => void;
  isPropertyListingModalOpen: boolean;
  closePropertyListingModal: () => void;
}) {
  return (
    <>
      <AdvisorModal 
        isOpen={isAdvisorModalOpen}
        onClose={closeAdvisorModal}
      />
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

  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);
  const [isPropertyListingModalOpen, setIsPropertyListingModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { favorites } = useFavorites();
  const { filters, updateFilter } = useFilters();
  
  const router = useRouter();
  const currentTransactionType = filters.transactionType;

  // Create memoized callbacks for modal handlers
  const openAdvisorModal = useCallback(() => setIsAdvisorModalOpen(true), []);
  const closeAdvisorModal = useCallback(() => setIsAdvisorModalOpen(false), []);
  const openPropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(true), []);
  const closePropertyListingModal = useCallback(() => setIsPropertyListingModalOpen(false), []);

  useEffect(() => {
    const checkUserRole = async (user: User | null) => {
      if (user) {
        try {
          const isAdmin = await checkIfUserIsAdmin(user.uid);
          if (isAdmin) {
            setUserRole('admin');
            return;
          }
          
          const isAdvisor = await checkIfUserIsAdvisor(user.uid);
          if (isAdvisor) {
            setUserRole('advisor');
            return;
          }
          
          setUserRole('user');
        } catch (error) {
          console.error('Error checking user role:', error);
          setUserRole('user');
        }
      } else {
        setUserRole('');
      }
    };
    
    const unsubscribe = onAuthStateChange((currentUser) => {
      setUser(currentUser);
      checkUserRole(currentUser);
      setLoading(false);
    });

    // Handle clicking outside dropdown to close it
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    // Cleanup subscription
    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
  };

  const handleBuyClick = () => {
    updateFilter('transactionType', 'compra');
  };

  if (loading) {
    return <nav className="bg-white shadow-sm h-16"></nav>;
  }

  return (
    <nav className="bg-white z-[9999] shadow-sm ">
      <div className="px-[5vw] flex flex-row items-center justify-between h-16">
        {/* Left side with logo and navigation */}
        <div className="flex flex-row gap-5 items-center">
          <div className="cursor-pointer cursor-pointer">
            <Link href="/" className="flex items-center">
              <img
                src="/assets/logos/logoPizo.svg"
                alt="Rentas Queretaro Logo"
                className="h-8 w-auto hover:opacity-80"
              />
            </Link>
          </div>
            <div>
            <Link href="/">
              <span className='font-semibold text-2xl mr-12 cursor-pointer'>pizo</span>
            </Link>
            </div>

          <nav className="-mb-px flex space-x-8 ">
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
              href="/qro/zibata"
              className={`${
              pathname?.startsWith('/qro/zibata')
                ? 'border-violet-800 text-violet-800'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-3 h-16 pt-5.5 px-1 border-b-3 font-medium text-sm cursor-pointer`}
            >
              Zibata
            </Link>
  
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-6">
          {user ? (
            // Usuario autenticado - Mostrar perfil y dropdown
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center focus:outline-none"
              >
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-400 flex items-center justify-center text-white font-medium shadow-sm transition-transform hover:scale-105">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-3 w-64 rounded-xl shadow-lg py-1 bg-white  ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {user.email}
                    </p>
                    {/* Add role indicator */}
                    {userRole && (
                      <p className="mt-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full 
                          ${userRole === 'admin' ? 'bg-purple-100 text-purple-800' : 
                            userRole === 'advisor' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {userRole === 'admin' ? 'Admin' : 
                           userRole === 'advisor' ? 'Asesor' : 'Usuario'}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="py-1">
                    <Link
                      href="/asesor"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none">
                        <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Panel de asesor
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="mr-3 h-5 w-5 text-red-400" viewBox="0 0 24 24" fill="none">
                        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Usuario no autenticado - Mostrar enlaces de acción
            <div className="flex items-center space-x-4">
                <Link
                href="/favoritos"
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full transition-colors relative group ${
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
              <button
                onClick={openAdvisorModal}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-800 to-violet-700 rounded-lg hover:from-violet-900 hover:to-violet-800 transition-all duration-200 shadow-sm hover:shadow"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21"/>
                </svg>
                ¿Necesitas un asesor?
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-4 space-y-1">
          <Link
            href="/explorar"
            onClick={(e) => {
              handleRentClick();
              setIsMobileMenuOpen(false);
            }}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              currentTransactionType === 'renta' 
                ? 'bg-violet-50 text-violet-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Rentar
          </Link>
          <Link
            href="/explorar"
            onClick={(e) => {
              handleBuyClick();
              setIsMobileMenuOpen(false);
            }}
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              currentTransactionType === 'compra'
                ? 'bg-violet-50 text-violet-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            Comprar
          </Link>
          <Link
            href="/zonas"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname?.startsWith('/zonas') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Zonas
          </Link>
          <Link
            href="/condos"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname?.startsWith('/condos') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Condominios
          </Link>
          <Link
            href="/favoritos"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              pathname?.startsWith('/favoritos') 
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Favoritos
          </Link>
        </div>
      </div>

      {/* Use the extracted modal component */}
      <MenuModals 
        isAdvisorModalOpen={isAdvisorModalOpen}
        closeAdvisorModal={closeAdvisorModal}
        isPropertyListingModalOpen={isPropertyListingModalOpen}
        closePropertyListingModal={closePropertyListingModal}
      />
    </nav>
  );
}