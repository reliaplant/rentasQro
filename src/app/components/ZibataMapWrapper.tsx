'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic import on the client side
const ZibataMap = dynamic(() => import('@/app/components/ZibataMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      Cargando mapa...
    </div>
  ),
});

interface ZibataMapWrapperProps {
  highlightedPolygonId?: string;
  className?: string;
  height?: string;
}

export default function ZibataMapWrapper(props: ZibataMapWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Only render the map client-side after component mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle polygon click inside the client component
  const handlePolygonClick = (polygonId: string) => {
    console.log("Clicked on polygon:", polygonId);
    
    // We can navigate or do other client-side actions here
    // For example:
    // const polygon = getPolygonData(polygonId);
    // if (polygon?.slug) {
    //   router.push(`/qro/zibata/${polygon.slug}`);
    // }
  };

  if (!isMounted) {
    return (
      <div 
        className={`${props.className || ''} bg-gray-100 flex items-center justify-center`}
        style={{ height: props.height || '100%' }}
      >
        Cargando mapa...
      </div>
    );
  }

  return (
    <ZibataMap 
      {...props} 
      onPolygonClick={handlePolygonClick}
    />
  );
}
