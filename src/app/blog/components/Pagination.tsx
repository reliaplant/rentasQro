'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Pagination({ 
  currentPage, 
  totalPages, 
  hasNextPage, 
  hasPrevPage 
}: PaginationProps) {
  const pathname = usePathname();
  
  // Function to create page URL
  const createPageURL = (pageNumber: number | string) => {
    return `${pathname}?page=${pageNumber}`;
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Maximum number of page buttons to show
    const maxPageButtons = 5;
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if total is less than max buttons
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range
      let startPage, endPage;
      
      if (currentPage <= 3) {
        // Near the start
        startPage = 2;
        endPage = 4;
        pageNumbers.push(...range(startPage, endPage));
        pageNumbers.push('ellipsis');
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push('ellipsis');
        startPage = totalPages - 3;
        endPage = totalPages - 1;
        pageNumbers.push(...range(startPage, endPage));
      } else {
        // Middle
        pageNumbers.push('ellipsis');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('ellipsis');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };
  
  // Helper function to generate range array
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };
  
  return (
    <nav aria-label="Paginación" className="flex justify-center">
      <ul className="flex items-center -space-x-px h-10 text-base">
        {/* Previous button */}
        <li>
          {hasPrevPage ? (
            <Link
              href={createPageURL(currentPage - 1)}
              className="flex items-center justify-center px-4 h-10 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="sr-only">Anterior</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
              </svg>
            </Link>
          ) : (
            <span className="flex items-center justify-center px-4 h-10 ml-0 leading-tight text-gray-300 bg-white border border-gray-300 rounded-l-lg cursor-not-allowed">
              <span className="sr-only">Anterior</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
              </svg>
            </span>
          )}
        </li>
        
        {/* Page numbers */}
        {getPageNumbers().map((pageNumber, index) => (
          <li key={index}>
            {pageNumber === 'ellipsis' ? (
              <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">
                ...
              </span>
            ) : (
              <Link
                href={createPageURL(pageNumber)}
                className={`flex items-center justify-center px-4 h-10 leading-tight border ${
                  currentPage === pageNumber 
                    ? 'text-violet-600 border-violet-300 bg-violet-50 hover:bg-violet-100 hover:text-violet-700' 
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                {pageNumber}
              </Link>
            )}
          </li>
        ))}
        
        {/* Next button */}
        <li>
          {hasNextPage ? (
            <Link
              href={createPageURL(currentPage + 1)}
              className="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
            >
              <span className="sr-only">Siguiente</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
            </Link>
          ) : (
            <span className="flex items-center justify-center px-4 h-10 leading-tight text-gray-300 bg-white border border-gray-300 rounded-r-lg cursor-not-allowed">
              <span className="sr-only">Siguiente</span>
              <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
