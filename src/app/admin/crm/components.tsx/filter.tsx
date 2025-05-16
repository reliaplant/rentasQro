'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/shared/firebase';
import { FaTimes, FaCheck, FaPlus, FaChartPie, FaChartBar, FaSearch, FaFileExcel, FaDownload } from 'react-icons/fa';

interface FiltersProps {
  filters: {
    transactionType: string;
    showDormant: boolean;
    asesor: string;
    searchTerm?: string; // New search term property
  };
  onFilterChange: (filters: any) => void;
  onCreateClick: () => void; // Props for create button
  showKpis: boolean;
  onToggleKpis: () => void;
  onExportCSV: () => void; // New prop for CSV export
}

// Memoized select component for better performance
const AdvisorSelect = memo(({ 
  selectedAdvisor, 
  advisors, 
  onChange 
}: { 
  selectedAdvisor: string, 
  advisors: string[], 
  onChange: (advisor: string) => void 
}) => {
  // Find the current advisor name for display
  const selectedAdvisorName = selectedAdvisor !== 'all'
    ? selectedAdvisor
    : 'Todos los asesores';

  return (
    <div className="relative">
      {selectedAdvisor === 'all' ? (
        // Standard dropdown when no specific advisor is selected
        <div className="relative w-48 sm:w-52">
          <select
            value={selectedAdvisor}
            onChange={(e) => onChange(e.target.value)}
            className={`
              w-full appearance-none rounded-full
              px-2.5 py-1.5 text-xs font-medium
              transition-all cursor-pointer
              bg-gray-50/80 text-gray-600 border border-gray-200/75 hover:bg-violet-50 hover:ring-2 hover:ring-violet-200
            `}
          >
            <option value="all">Todos los asesores</option>
            {advisors.map((advisor) => (
              <option 
                key={advisor} 
                value={advisor}
                className={selectedAdvisor === advisor ? '!text-violet-600' : ''}
              >
                {advisor}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      ) : (
        // Active filter with reset button
        <button
          onClick={() => onChange('all')}
          className="flex items-center justify-between bg-violet-50 text-violet-700 ring-2 ring-violet-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-medium transition-all"
        >
          <span>{selectedAdvisorName}</span>
          <FaTimes className="w-3 h-3 ml-2 text-violet-500 hover:scale-125 hover:text-violet-700 transition-all duration-200 cursor-pointer" />
        </button>
      )}
    </div>
  );
});

AdvisorSelect.displayName = 'AdvisorSelect';

export default function Filters({ 
  filters, 
  onFilterChange, 
  onCreateClick, 
  showKpis, 
  onToggleKpis,
  onExportCSV // Add the new prop
}: FiltersProps) {
  const [asesores, setAsesores] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || ''); // Initialize with filter value
  
  // Add isClient state to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Fetch unique advisors from negocios collection
  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "negocios"));
        const uniqueAsesores = new Set<string>();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.asesor) {
            uniqueAsesores.add(data.asesor);
          }
        });
        
        setAsesores(Array.from(uniqueAsesores).sort());
      } catch (error) {
        console.error("Error fetching asesores:", error);
      }
    };
    
    fetchAsesores();
  }, []);

  // Memoized handler for transaction type
  const handleTransactionTypeChange = useCallback((type: string) => {
    // Don't update if already set to this value
    if (filters.transactionType === type) return;
    
    onFilterChange({ transactionType: type });
  }, [filters.transactionType, onFilterChange]);

  // Memoized handler for advisor selection
  const handleAdvisorChange = useCallback((advisor: string) => {
    console.log(`Advisor selected: ${advisor}`); // Debug logging
    onFilterChange({ asesor: advisor });
  }, [onFilterChange]);

  // Memoized handler for toggling dormant leads
  const handleToggleDormant = useCallback(() => {
    onFilterChange({ showDormant: !filters.showDormant });
  }, [filters.showDormant, onFilterChange]);

  // Memoized handler for search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search to avoid excessive filtering
    const timeoutId = setTimeout(() => {
      onFilterChange({ searchTerm: value });
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [onFilterChange]);

  // Define consistent button styles
  const baseButtonStyles = `
    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
    hover:bg-violet-50 hover:ring-2 hover:ring-violet-200
  `;

  const selectedButtonStyles = `
    bg-violet-50 text-violet-700 ring-2 ring-violet-200
    shadow-sm shadow-violet-100
  `;

  const unselectedButtonStyles = `
    bg-gray-50/80 text-gray-600 hover:text-violet-600
    border border-gray-200/75
  `;

  return (
    <div className="w-full bg-white border-b border-gray-200 z-40 transition-all duration-300 shadow-sm hover:shadow-md">
      <div className="px-[2vw] py-3">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 md:gap-0">
          {/* Left section - Title */}
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <span className="font-medium">Filtros de CRM</span>
            <div className="h-4 w-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">Refina tus leads para una gestión más eficiente</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 pr-4 py-1.5 rounded-full border border-gray-200 text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 w-64"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              {searchTerm && (
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    onFilterChange({ searchTerm: '' });
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {/* CSV Export Button */}
            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700"
            >
              <FaDownload className="w-3 h-3" />
              Exportar CSV
            </button>
            
            {/* Toggle KPIs Button - Always gray regardless of state */}
            <button
              onClick={onToggleKpis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {showKpis ? (
                <>
                  <FaChartPie className="w-3 h-3" />
                  Ocultar KPIs
                </>
              ) : (
                <>
                  <FaChartBar className="w-3 h-3" />
                  Mostrar KPIs
                </>
              )}
            </button>
            
            {/* Create Lead Button */}
            <button
              onClick={onCreateClick}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full flex items-center text-xs font-medium"
            >
              <FaPlus className="w-3 h-3 mr-1" />
              Crear Lead
            </button>
            
            {/* Scrollable container for filters */}
            <div className="overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-[5vw] px-[5vw] md:mx-0 md:px-0">
              <div className="flex items-center gap-6 flex-nowrap md:flex-wrap min-w-max md:min-w-0">
                
                {/* Dormant Toggle */}
                {isClient && (
                  <button
                    onClick={handleToggleDormant}
                    className={`
                      ${baseButtonStyles}
                      ${filters.showDormant ? selectedButtonStyles : unselectedButtonStyles}
                      flex items-center gap-2 cursor-pointer
                    `}
                  >
                    {filters.showDormant && <FaCheck className="w-3 h-3 text-violet-600" />}
                    Mostrar Dormidos
                  </button>
                )}

                {/* Advisor Filter */}
                {isClient && asesores.length > 0 && (
                  <AdvisorSelect
                    selectedAdvisor={filters.asesor}
                    advisors={asesores}
                    onChange={handleAdvisorChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
