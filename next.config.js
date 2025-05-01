/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  distDir: '.next',
  webpack: (config) => {
    // Résolution de l'alias @/
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src'
    };
    return config;
  }
}

module.exports = nextConfig; 