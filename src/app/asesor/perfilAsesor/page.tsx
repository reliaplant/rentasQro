"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getCurrentUser, getAdvisorProfile, updateAdvisorProfile } from '@/app/shared/firebase';
import type { AdvisorData } from '@/app/shared/firebase';

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
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
    </div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Mi Perfil</h1>
        {formData.verified && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            Verificado
          </span>
        )}
      </div>
      
      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Foto de perfil actualizada con Next Image */}
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            <div className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-violet-100 shadow-sm">
              {photoPreview ? (
                <Image
                  src={photoPreview}
                  alt="Foto de perfil"
                  fill
                  sizes="96px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="h-full w-full bg-violet-50 flex items-center justify-center text-violet-300">
                  No foto
                </div>
              )}
            </div>
          </div>
          <label className="block flex-1">
            <span className="text-sm font-medium text-gray-700 mb-1 block">Foto de perfil</span>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 transition-all"
            />
          </label>
        </div>

        {/* Campos del formulario */}
        <div className="grid grid-cols-1 gap-6 bg-white p-6 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biografía</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={6}
              className="block w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-colors duration-200"
              required
              placeholder="Cuéntanos sobre tu experiencia como asesor inmobiliario..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className={`
            w-full px-4 py-3 text-sm font-medium rounded-lg
            transition-all duration-200 shadow-sm
            ${saving 
              ? 'bg-violet-100 text-violet-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-violet-800 to-violet-700 text-white hover:from-violet-900 hover:to-violet-800 hover:shadow'}
          `}
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-violet-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              <span>Guardando cambios...</span>
            </div>
          ) : (
            'Guardar Cambios'
          )}
        </button>
      </form>
    </div>
  );
}