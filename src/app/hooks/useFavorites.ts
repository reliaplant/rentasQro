import { useState, useEffect } from 'react';

/**
 * Custom hook for managing favorite properties locally with localStorage
 */
export function useFavorites() {
  // Store favorite property IDs in state
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Load favorites from localStorage
  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('propertyFavorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error parsing favorites:', e);
        setFavorites([]);
      }
    }
  };

  // On mount, load favorites from localStorage and listen for storage events
  useEffect(() => {
    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, []);
  
  // Check if a property is in favorites
  const isFavorite = (propertyId: string): boolean => {
    return favorites.includes(propertyId);
  };
  
  // Toggle a property in favorites
  const toggleFavorite = (propertyId: string): void => {
    const newFavorites = isFavorite(propertyId)
      ? favorites.filter(id => id !== propertyId) // Remove if exists
      : [...favorites, propertyId]; // Add if doesn't exist
    
    // Update state
    setFavorites(newFavorites);
    
    // Save to localStorage
    localStorage.setItem('propertyFavorites', JSON.stringify(newFavorites));
    
    // Dispatch storage event to sync other components
    window.dispatchEvent(new Event('storage'));
  };
  
  return { favorites, isFavorite, toggleFavorite };
}
