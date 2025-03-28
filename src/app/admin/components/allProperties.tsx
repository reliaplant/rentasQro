import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { getProperties } from '@/app/shared/firebase';
import { PropertyData } from '@/app/shared/interfaces';


export default function AllProperties() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof PropertyData>('publicationDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        setProperties(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const sortProperties = (a: PropertyData, b: PropertyData) => {
    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  };

  const toggleSort = (field: keyof PropertyData) => {
    if (field === sortField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: keyof PropertyData }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('propertyType')}>
              <div className="flex items-center gap-2">
                Propiedad
                <SortIcon field="propertyType" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ubicación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => toggleSort('price')}>
              <div className="flex items-center gap-2">
                Precio
                <SortIcon field="price" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Métricas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {properties.sort(sortProperties).map((property) => (
            <tr key={property.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0">
                    {property.imageUrls && property.imageUrls[0] ? (
                      <Image
                        src={property.imageUrls[0]}
                        alt={`Imagen de ${property.propertyType}`}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {property.propertyType}
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.propertyType}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{property.zone}</div>
                <div className="text-sm text-gray-500">{property.condo}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-medium">${property.price.toLocaleString()}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-gray-400" />
                    <span className="text-sm">{property.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span className="text-sm">{property.whatsappClicks}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${property.status === 'publicada' ? 'bg-green-100 text-green-800' : 
                    property.status === 'borrador' ? 'bg-gray-100 text-gray-800' :
                    property.status === 'vendida' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {property.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}