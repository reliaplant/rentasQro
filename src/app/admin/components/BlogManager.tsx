"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getAllBlogPosts, 
  deleteBlogPost, 
  getAllContributors, 
  deleteContributor 
} from '@/app/admin/blog-editor/utils/firebase';
import { BlogPost, BlogContributor } from '@/app/admin/blog-editor/types';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function BlogManager() {
  const [activeTab, setActiveTab] = useState<'posts' | 'contributors'>('posts');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [contributors, setContributors] = useState<BlogContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchBlogPosts();
    } else {
      fetchContributors();
    }
  }, [activeTab]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const posts = await getAllBlogPosts();
      setBlogPosts(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      toast.error("Error al cargar las entradas del blog");
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async () => {
    try {
      setLoading(true);
      const allContributors = await getAllContributors();
      setContributors(allContributors);
    } catch (error) {
      console.error("Error fetching contributors:", error);
      toast.error("Error al cargar los articulistas");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta entrada del blog?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteBlogPost(id);
      toast.success("Entrada eliminada correctamente");
      setBlogPosts(prevPosts => prevPosts.filter(post => post.id !== id));
    } catch (error) {
      console.error("Error deleting blog post:", error);
      toast.error("Error al eliminar la entrada");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteContributor = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este articulista?")) {
      return;
    }

    try {
      setDeleting(id);
      await deleteContributor(id);
      toast.success("Articulista eliminado correctamente");
      setContributors(prevContributors => prevContributors.filter(contributor => contributor.id !== id));
    } catch (error) {
      console.error("Error deleting contributor:", error);
      toast.error("Error al eliminar el articulista");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Administrar Blog</h1>
        
        {activeTab === 'posts' ? (
          <Link href="/admin/blog-editor?return=blog" className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700">
            <PlusIcon className="h-5 w-5" />
            <span>Nueva Entrada</span>
          </Link>
        ) : (
          <Link href="/admin/blog-editor/contributor?return=blog" className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-indigo-700">
            <PlusIcon className="h-5 w-5" />
            <span>Nuevo Articulista</span>
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`${
              activeTab === 'posts'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Entradas de Blog
          </button>
          <button
            onClick={() => setActiveTab('contributors')}
            className={`${
              activeTab === 'contributors'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Articulistas
          </button>
        </nav>
      </div>

      {/* Blog Posts Table */}
      {activeTab === 'posts' && (
        <>
          {blogPosts.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No hay entradas de blog disponibles</p>
              <Link href="/admin/blog-editor?return=blog" className="text-indigo-600 font-medium hover:underline">
                Crear tu primera entrada
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {post.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{post.author}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(post.publishDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/blog/${post.id}`} className="text-indigo-600 hover:text-indigo-900" title="Ver">
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link href={`/admin/blog-editor?id=${post.id}&return=blog`} className="text-blue-600 hover:text-blue-900" title="Editar">
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => post.id && handleDeletePost(post.id)}
                            disabled={deleting === post.id}
                            className={`text-red-600 hover:text-red-900 ${deleting === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Eliminar"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Contributors Table */}
      {activeTab === 'contributors' && (
        <>
          {contributors.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No hay articulistas disponibles</p>
              <Link href="/admin/blog-editor/contributor?return=blog" className="text-indigo-600 font-medium hover:underline">
                Crear tu primer articulista
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contributors.map((contributor) => (
                    <tr key={contributor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {contributor.photo ? (
                            <img
                              src={contributor.photo}
                              alt={contributor.name}
                              className="h-10 w-10 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                              <span className="text-gray-500 font-medium">
                                {contributor.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {contributor.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{contributor.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          contributor.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {contributor.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link 
                            href={`/admin/blog-editor/contributor?id=${contributor.id}&return=blog`} 
                            className="text-blue-600 hover:text-blue-900" 
                            title="Editar"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => contributor.id && handleDeleteContributor(contributor.id)}
                            disabled={deleting === contributor.id}
                            className={`text-red-600 hover:text-red-900 ${deleting === contributor.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Eliminar"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
