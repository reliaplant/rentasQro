"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { addProperty, getProperty, updateProperty, deleteProperty } from '@/app/services/firebase';

interface PropertyFormData {
  propertyType: 'casa' | 'departamento' | '';
  transactionType: 'renta' | 'venta' | '';
  price: number | '';
  bathrooms: number | '';
  bedrooms: number | '';
  furnished: boolean;
  zone: string;
  privateComplex: string;
  advisor: string;
  publicationDate: string;
  maintenanceCost: number | '';
  maintenanceIncluded: boolean;
  constructionYear: number | '';
  petsAllowed: boolean;
  status: 'disponible' | 'no disponible' | 'apartada' | '';
  dealType: 'directo' | 'asesor' | '';
}

// Export the component with dynamic import to disable SSR
export default dynamic(() => Promise.resolve(CrearPropiedad), {
  ssr: false
});

// Create the actual component
function CrearPropiedad() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('id');
  const isEditMode = Boolean(propertyId);
  const router = useRouter();

  const [formData, setFormData] = useState<PropertyFormData>({
    propertyType: '',
    transactionType: '',
    price: '',
    bathrooms: '',
    bedrooms: '',
    furnished: false,
    zone: '',
    privateComplex: '',
    advisor: '',
    publicationDate: new Date().toISOString().split('T')[0],
    maintenanceCost: '',
    maintenanceIncluded: false,
    constructionYear: '',
    petsAllowed: false,
    status: '',
    dealType: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [initialImageUrls, setInitialImageUrls] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!propertyId) return;

      try {
        setLoading(true);
        const property = await getProperty(propertyId);
        setFormData({
          propertyType: property.propertyType as 'casa' | 'departamento',
          transactionType: property.transactionType as 'renta' | 'venta',
          price: property.price,
          bathrooms: property.bathrooms,
          bedrooms: property.bedrooms,
          furnished: property.furnished,
          zone: property.zone,
          privateComplex: property.privateComplex,
          advisor: property.advisor,
          publicationDate: property.publicationDate,
          maintenanceCost: property.maintenanceCost ?? '',
          maintenanceIncluded: property.maintenanceIncluded ?? false,
          constructionYear: property.constructionYear,
          petsAllowed: property.petsAllowed ?? false,
          status: property.status,
          dealType: property.dealType,
        });
        setInitialImageUrls(property.imageUrls || []);
      } catch (error) {
        setError('Error al cargar la propiedad');
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked,
      });
    } else if (name === 'price' || name === 'bathrooms' || name === 'bedrooms' || name === 'maintenanceCost' || name === 'constructionYear') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const propertyData = {
        propertyType: formData.propertyType as 'casa' | 'departamento',
        transactionType: formData.transactionType as 'renta' | 'venta',
        price: formData.price as number,
        bathrooms: formData.bathrooms as number,
        bedrooms: formData.bedrooms as number,
        furnished: formData.furnished,
        zone: formData.zone,
        privateComplex: formData.privateComplex,
        advisor: formData.advisor,
        publicationDate: formData.publicationDate,
        maintenanceCost: formData.maintenanceCost as number,
        maintenanceIncluded: formData.maintenanceIncluded,
        constructionYear: formData.constructionYear as number,
        petsAllowed: formData.petsAllowed,
        status: formData.status as 'disponible' | 'no disponible' | 'apartada',
        dealType: formData.dealType as 'directo' | 'asesor',
        imageUrls: initialImageUrls
      };

      if (isEditMode && propertyId) {
        await updateProperty(propertyId, propertyData, images);
      } else {
        if (images.length === 0) {
          throw new Error('Por favor, selecciona al menos una imagen');
        }
        await addProperty(propertyData, images);
      }

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!propertyId) return;
    
    try {
      setLoading(true);
      await deleteProperty(propertyId);
      router.push('/lista-propiedades');
    } catch (error) {
      setError('Error al eliminar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  if (isEditMode && loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => router.push('/lista-propiedades')}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <span className="mr-2">←</span> Volver
        </button>
        
        {isEditMode && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {isEditMode ? 'Editar Propiedad' : 'Crear Nueva Propiedad'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Propiedad creada exitosamente!
        </div>
      )}

      <form className="bg-white shadow-md rounded-lg p-6" onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Tipo de Inmueble:</label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value="casa"
                checked={formData.propertyType === 'casa'}
                onChange={handleChange}
                required
                className="mr-2"
              />
              <span>Casa</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="propertyType"
                value="departamento"
                checked={formData.propertyType === 'departamento'}
                onChange={handleChange}
                className="mr-2"
              />
              <span>Departamento</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Tipo de Operación:</label>
          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="transactionType"
                value="renta"
                checked={formData.transactionType === 'renta'}
                onChange={handleChange}
                required
                className="mr-2"
              />
              <span>Renta</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="transactionType"
                value="venta"
                checked={formData.transactionType === 'venta'}
                onChange={handleChange}
                className="mr-2"
              />
              <span>Venta</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="price" className="block text-gray-700 mb-2">Precio ($):</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <div className="w-1/2">
            <label htmlFor="bathrooms" className="block text-gray-700 mb-2">Baños:</label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
              step="0.5"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-1/2">
            <label htmlFor="bedrooms" className="block text-gray-700 mb-2">Recámaras:</label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="0"
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="furnished"
              checked={formData.furnished}
              onChange={handleChange}
              className="mr-2 h-5 w-5"
            />
            <span>Amueblado</span>
          </label>
        </div>

        <div className="mb-6">
          <label htmlFor="zone" className="block text-gray-700 mb-2">Zona:</label>
          <select
            id="zone"
            name="zone"
            value={formData.zone}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una zona</option>
            <option value="zakia">Zakia</option>
            <option value="refugio">El Refugio</option>
            <option value="zibata">Zibatá</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="privateComplex" className="block text-gray-700 mb-2">Privada:</label>
          <select
            id="privateComplex"
            name="privateComplex"
            value={formData.privateComplex}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona una privada</option>
            <option value="thandi">Thandi</option>
            <option value="sensi">Sensi</option>
            <option value="azhala">Azhala</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="advisor" className="block text-gray-700 mb-2">Asesor:</label>
          <input
            type="text"
            id="advisor"
            name="advisor"
            value={formData.advisor}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="publicationDate" className="block text-gray-700 mb-2">Fecha de Publicación:</label>
          <input
            type="date"
            id="publicationDate"
            name="publicationDate"
            value={formData.publicationDate}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="constructionYear" className="block text-gray-700 mb-2">Año de construcción:</label>
          <input
            type="number"
            id="constructionYear"
            name="constructionYear"
            value={formData.constructionYear}
            onChange={handleChange}
            min="1900"
            max={new Date().getFullYear()}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="status" className="block text-gray-700 mb-2">Estatus:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar estatus</option>
            <option value="disponible">Disponible</option>
            <option value="no disponible">No disponible</option>
            <option value="apartada">Apartada</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="dealType" className="block text-gray-700 mb-2">Tipo de trato:</label>
          <select
            id="dealType"
            name="dealType"
            value={formData.dealType}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo de trato</option>
            <option value="directo">Directo con dueño</option>
            <option value="asesor">Con asesor</option>
          </select>
        </div>

        {formData.transactionType === 'renta' && (
          <>
            <div className="mb-6">
              <label htmlFor="maintenanceCost" className="block text-gray-700 mb-2">Costo de mantenimiento:</label>
              <input
                type="number"
                id="maintenanceCost"
                name="maintenanceCost"
                value={formData.maintenanceCost}
                onChange={handleChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="maintenanceIncluded"
                  checked={formData.maintenanceIncluded}
                  onChange={handleChange}
                  className="mr-2 h-5 w-5"
                />
                <span>Mantenimiento incluido en la renta</span>
              </label>
            </div>

            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="petsAllowed"
                  checked={formData.petsAllowed}
                  onChange={handleChange}
                  className="mr-2 h-5 w-5"
                />
                <span>Acepta mascotas</span>
              </label>
            </div>
          </>
        )}

        <div className="mb-6">
          <label className="block text-gray-700 mb-2">
            Imágenes de la propiedad:
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {images.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {images.length} {images.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
            </div>
          )}
        </div>

        {isEditMode && initialImageUrls.length > 0 && (
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Imágenes actuales:</label>
            <div className="grid grid-cols-3 gap-4">
              {initialImageUrls.map((url, index) => (
                <img key={index} src={url} alt={`Property ${index + 1}`} className="w-full h-24 object-cover rounded" />
              ))}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className={`w-full py-3 px-6 rounded-md text-white ${
            loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors`}
          disabled={loading}
        >
          {loading ? 'Guardando...' : isEditMode ? 'Actualizar Propiedad' : 'Crear Propiedad'}
        </button>
      </form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">¿Confirmar eliminación?</h3>
            <p className="text-gray-600 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}