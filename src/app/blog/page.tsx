import Link from 'next/link';
import { getPublishedBlogPosts, getAllContributors } from '@/app/shared/firebase';
import { BlogPost, BlogContributor } from '@/app/admin/blog-editor/types';
import Pagination from './components/Pagination';

// Define posts per page
const POSTS_PER_PAGE = 9;

// Updated function to get paginated blog data
async function getBlogData(page = 1) {
  try {
    const allPosts = await getPublishedBlogPosts();
    const contributors = await getAllContributors();
    
    // Calculate pagination values
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const currentPage = Math.min(Math.max(1, page), totalPages || 1);
    
    // Get posts for current page
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    const paginatedPosts = allPosts.slice(startIndex, endIndex);
    
    return {
      posts: paginatedPosts,
      contributorsMap: contributors.reduce((map, contributor) => {
        map[contributor.name] = contributor;
        return map;
      }, {} as Record<string, BlogContributor>),
      pagination: {
        currentPage,
        totalPages,
        totalPosts,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return {
      posts: [],
      contributorsMap: {},
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalPosts: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    };
  }
}

export default async function BlogPage({ searchParams }: { searchParams: { page?: string } }) {
  try {
    // Get page from URL params or default to 1
    const page = searchParams?.page ? parseInt(searchParams.page, 10) : 1;
    
    // Fetch blog data with pagination
    const { posts, contributorsMap, pagination } = await getBlogData(page);
    
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date);
      } catch (e) {
        return dateString;
      }
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Blog</h1>
        
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay publicaciones disponibles.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const contributor = contributorsMap[post.author];
                const postSlug = post.slug || post.id;
                
                return (
                  <Link 
                    href={`/blog/${postSlug}`} 
                    key={post.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 w-full">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      <h2 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h2>
                      
                      <div className="flex items-center mb-3">
                        {contributor?.photo ? (
                          <img 
                            src={contributor.photo} 
                            alt={contributor.name}
                            className="w-8 h-8 rounded-full mr-2 object-cover" 
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                            <span className="text-gray-500 font-medium text-xs">
                              {post.author.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{post.author}</p>
                          <p className="text-xs text-gray-500">{formatDate(post.publishDate)}</p>
                        </div>
                      </div>
                      
                      {post.summary && (
                        <p className="text-gray-600 mb-3 line-clamp-3">{post.summary}</p>
                      )}
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-gray-500 text-xs">+{post.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            
            {/* Pagination component */}
            {pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error rendering blog page:", error);
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Error al cargar el blog</h1>
        <p className="text-gray-600 mb-8">
          Lo sentimos, ha ocurrido un error al intentar cargar el blog.
        </p>
        <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          Volver al inicio
        </Link>
      </div>
    );
  }
}
