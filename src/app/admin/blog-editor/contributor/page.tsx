"use client";

import { useState, useEffect, FormEvent, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { BlogContributor } from '@/app/admin/blog-editor/types';
import { 
  getContributor, 
  createContributor, 
  updateContributor, 
  uploadContributorPhoto 
} from '@/app/admin/blog-editor/utils/firebase';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import imageCompression from 'browser-image-compression';

// Simple loading component
const LoadingSpinner = () => (
  <div className="p-8 flex justify-center items-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
  </div>
);

// Main wrapper component with Suspense
export default function ContributorFormPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ContributorForm />
    </Suspense>
  );
}

// Content component that uses useSearchParams
function ContributorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contributorId = searchParams.get('id');
  const isEditing = !!contributorId;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [contributor, setContributor] = useState<BlogContributor>({
    name: '',
    email: '',
    bio: '',
    photo: '',
    active: true,
    socialMedia: {
      twitter: '',
      linkedin: '',
      instagram: ''
    }
  });

  useEffect(() => {
    if (contributorId) {
      fetchContributor(contributorId);
    }
  }, [contributorId]);

  const fetchContributor = async (id: string) => {
    try {
      setLoading(true);
      const data = await getContributor(id);
      if (data) {
        setContributor(data);
      } else {
        toast.error('No se encontró el articulista');
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error fetching contributor:', error);
      toast.error('Error al cargar los datos del articulista');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'socialMedia') {
        setContributor(prev => ({
          ...prev,
          socialMedia: {
            ...prev.socialMedia,
            [child]: value
          }
        }));
      }
    } else {
      setContributor(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setContributor(prev => ({ ...prev, [name]: checked }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Compress image before upload
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      // For preview purposes, create a local URL
      const localUrl = URL.createObjectURL(compressedFile);
      setContributor(prev => ({ 
        ...prev, 
        photo: localUrl, 
        photoFile: compressedFile 
      }));
      
      toast.success('Imagen cargada correctamente');
    } catch (error) {
      console.error('Error al cargar la imagen:', error);
      toast.error('Error al cargar la imagen');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!contributor.name || !contributor.email) {
      toast.error('El nombre y el email son obligatorios');
      return;
    }

    try {
      setSubmitting(true);

      // Handle photo upload if there's a new photo
      let photoUrl = contributor.photo;
      if (contributor.photoFile) {
        if (isEditing && contributorId) {
          photoUrl = await uploadContributorPhoto(contributor.photoFile, contributorId);
        } else {
          // For new contributors, we'll upload the photo after creating the contributor
          // to have an ID for the storage path
          const tempId = 'temp-' + Date.now();
          photoUrl = await uploadContributorPhoto(contributor.photoFile, tempId);
        }
      }

      // Prepare data for submission (remove the temporary file property)
      const { photoFile, ...dataToSubmit } = contributor;
      const submitData = {
        ...dataToSubmit,
        photo: photoUrl
      };

      if (isEditing && contributorId) {
        await updateContributor(contributorId, submitData);
        toast.success('Articulista actualizado correctamente');
      } else {
        await createContributor(submitData);
        toast.success('Articulista creado correctamente');
      }

      router.push('/admin');
    } catch (error) {
      console.error('Error saving contributor:', error);
      toast.error('Error al guardar el articulista');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/admin?tab=blog" className="inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Volver al panel
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar Articulista' : 'Nuevo Articulista'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre*
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={contributor.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={contributor.email}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              value={contributor.bio}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
              Foto de perfil
            </label>
            <div className="flex items-center space-x-4">
              {contributor.photo && (
                <img
                  src={contributor.photo}
                  alt={contributor.name}
                  className="h-24 w-24 object-cover rounded-full"
                />
              )}
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="p-2 border rounded"
              />
            </div>
          </div>

          <div className="border-t pt-4">
            <h2 className="font-medium text-lg mb-2">Redes sociales</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="socialMedia.twitter" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <input
                  type="text"
                  id="socialMedia.twitter"
                  name="socialMedia.twitter"
                  value={contributor.socialMedia?.twitter || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="@username"
                />
              </div>

              <div>
                <label htmlFor="socialMedia.linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  type="text"
                  id="socialMedia.linkedin"
                  name="socialMedia.linkedin"
                  value={contributor.socialMedia?.linkedin || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="URL completa"
                />
              </div>

              <div>
                <label htmlFor="socialMedia.instagram" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  id="socialMedia.instagram"
                  name="socialMedia.instagram"
                  value={contributor.socialMedia?.instagram || ''}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              name="active"
              checked={contributor.active}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
              Articulista activo
            </label>
          </div>

          <div className="flex justify-end">
            <Link
              href="/admin"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-2"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {submitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
