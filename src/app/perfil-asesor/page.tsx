"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getAdvisorProfile, updateAdvisorProfile } from '@/app/services/firebase';
import type { AdvisorData } from '@/app/services/firebase';

export default function PerfilAsesor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<AdvisorData>>({
    name: '',
    phone: '',
    bio: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      linkedin: ''
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const profile = await getAdvisorProfile(user.uid);
        if (profile) {
          setFormData(profile);
          if (profile.photo) {
            setPhotoPreview(profile.photo);
          }
        }
      } catch (error) {
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPhotoFile(e.target.files[0]);
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error('No autorizado');

      await updateAdvisorProfile(user.uid, formData, photoFile || undefined);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      setError('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Perfil del Asesor</h1>
        {formData.verified && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Verificado
          </span>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="shrink-0">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  No foto
                </div>
              )}
            </div>
          </div>
          <label className="block">
            <span className="sr-only">Elegir foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Teléfono con whatsapp</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Biografía</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="Cuéntanos sobre tu experiencia como asesor inmobiliario..."
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Redes Sociales</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Facebook</label>
            <input
              type="url"
              value={formData.socialMedia?.facebook}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, facebook: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Instagram</label>
            <input
              type="url"
              value={formData.socialMedia?.instagram}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, instagram: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
            <input
              type="url"
              value={formData.socialMedia?.linkedin}
              onChange={(e) => setFormData({
                ...formData,
                socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            saving ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}