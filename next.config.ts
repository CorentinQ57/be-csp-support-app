/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Amélioration de la compatibilité avec Vercel
  experimental: {
    // Optimisations pour les grands projets
    turbotrace: {
      logLevel: 'error'
    }
  }
}

export default nextConfig
