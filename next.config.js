/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images configuration for optimization
  images: {
    domains: ['firebasestorage.googleapis.com', 'localhost'],
    deviceSizes: [640, 750, 828, 1080, 1200], // Customize breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Smaller image sizes
    formats: ['image/webp'], // Prefer WebP for better compression
    minimumCacheTTL: 60, // Cache optimized images
    // Remove the 'quality' option as it's not recognized at the 'images' level
  },
  
  // Move outputFileTracingExcludes from experimental to root level
  outputFileTracingExcludes: {
    // Add your exclusions here if needed
  },
  
  // Remove deprecated swcMinify (it's enabled by default in newer versions)
  // Remove cssModules (use the built-in CSS Modules support instead)
  
  // Set experimental features if needed
  experimental: {
    // Add valid experimental features here if needed
  },
  
  // Other valid Next.js configuration options
  reactStrictMode: true,
}

module.exports = nextConfig