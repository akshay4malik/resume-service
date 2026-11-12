import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow images from Supabase and Google (profile pictures)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  // Silence "Module not found" for optional heavy libs that only run server-side
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // unpdf uses Node.js canvas — exclude from client bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
      }
    }
    return config
  },
}

export default nextConfig

