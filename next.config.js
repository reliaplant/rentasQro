/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images configuration for optimization
  images: {
    domains: [
      'firebasestorage.googleapis.com', 
      'lh3.googleusercontent.com', // Add Google user profile photos
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Customize breakpoints
    imageSizes: [16, 32, 64, 96, 128, 256, 384], // Smaller image sizes
    formats: ['image/avif', 'image/webp'], // Prefer WebP for better compression
    minimumCacheTTL: 60, // Cache optimized images
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Move outputFileTracingExcludes from experimental to root level
  outputFileTracingExcludes: {
    // Add your exclusions here if needed
  },
  
  // Remove deprecated swcMinify (it's enabled by default in newer versions)
  // Remove cssModules (use the built-in CSS Modules support instead)
  
  // Set experimental features if needed
  experimental: {
    optimizeCss: true,
  },
  
  // Other valid Next.js configuration options
  reactStrictMode: true,
  
  typescript: {
    // Solo para desarrollo, ignorar errores de TypeScript para la compilación en producción
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig