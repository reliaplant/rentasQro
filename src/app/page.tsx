"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProperties } from '@/app/shared/firebase';
import type { PropertyData } from '@/app/shared/interfaces';

// Define Nubank-inspired color palette
const colors = {
  primary: '#8A05BE', // Main purple color
  primaryLight: '#A64FD5', // Lighter purple for hover states
  primaryDark: '#6D039A', // Darker purple for active states
  background: '#F5F5F7', // Very light gray background
  white: '#FFFFFF', // Pure white
  textDark: '#333333', // Dark text for readability
  textLight: '#666666', // Light text for secondary info
  border: '#E0E0E0', // Light border color
};

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'renta' | 'venta'>('renta');
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        // Only load published properties with status 'publicada'
        const allProperties = await getProperties();
        const publishedProperties = allProperties.filter(p => p.status === 'publicada');
        setProperties(publishedProperties);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/propiedades?type=${activeTab}${searchLocation ? `&zone=${encodeURIComponent(searchLocation)}` : ''}`);
  };

  // Filter properties based on active tab (rent or sale)
  const filteredProperties = properties.filter(property => {
    if (activeTab === 'renta') {
      return ['renta', 'ventaRenta'].includes(property.transactionType);
    } else {
      return ['venta', 'ventaRenta'].includes(property.transactionType);
    }
  });

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.background, fontFamily: 'Montserrat, sans-serif' }}>
      {/* Hero Section with Search */}
      
        
    </main>
  );
}