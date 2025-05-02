/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [], // Añadir aquí cualquier dominio externo si es necesario
    // Configuración para permitir SVG en el componente Image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Incrementar tamaño máximo si es necesario para SVGs grandes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  // Add optimization options for Firebase deployment
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // Disable CSS modules to help with build issues
  cssModules: false,
  experimental: {
    // Reduce the size of error stack traces in production
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-darwin-x64',
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/darwin-x64',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  }
};

module.exports = nextConfig;