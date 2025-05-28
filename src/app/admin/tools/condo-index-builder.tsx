'use client';

import { useState } from 'react';
import { buildCondoIndex } from '@/app/shared/firebase';

export default function CondoIndexBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleBuildIndex = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      await buildCondoIndex();
      setResult({
        success: true,
        message: "Índice de condominios construido exitosamente"
      });
    } catch (error) {
      console.error("Error building index:", error);
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Constructor de Índice de Condominios</h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Esta herramienta crea un índice que mapea los slugs de URL amigables a los IDs de condominios,
          permitiendo búsquedas más eficientes.
        </p>
        <p className="text-sm text-gray-500 mb-4">
          <strong>Nota:</strong> Esta operación solo es necesaria cuando se agregan nuevos condominios.
        </p>
      </div>
      
      <button
        onClick={handleBuildIndex}
        disabled={isLoading}
        className={`
          px-4 py-2 rounded-md text-white font-medium
          ${isLoading ? 'bg-gray-400' : 'bg-violet-600 hover:bg-violet-700'}
          transition-colors duration-200
        `}
      >
        {isLoading ? 'Construyendo índice...' : 'Construir índice'}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
}
