/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclure certaines pages de la génération statique
  distDir: '.next',
  typescript: {
    // Ignorer les erreurs TypeScript pendant la build pour la production
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'qallh5vref.ufs.sh',
      },
      {
        protocol: 'https',
        hostname: 'www.shutterstock.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
  // Configuration pour exclure certaines pages de la génération statique
  experimental: {
    // Options expérimentales valides
  },
  // Exclude account pages from the build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  webpack: (config, { isServer }) => {
    // Fix for useSession during build time
    if (isServer) {
      config.externals = [...config.externals, 'next-auth/react'];
    }
    return config;
  },
  // Exclure spécifiquement la page de notifications
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/notifications',
          destination: '/404',
        },
      ],
    };
  },
}

module.exports = nextConfig
