/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ze6i4xqr0l.ufs.sh',
      },
      {
        protocol: 'https',
        hostname: 'qallh5vref.ufs.sh',
      },
    ],
    domains: ['utfs.io'],
  },
};

export default nextConfig;
