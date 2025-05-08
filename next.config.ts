import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false,
      },
      // Also handle incorrect path to ensure redirect works
      {
        source: '/auth/login',
        destination: '/login',
        permanent: false,
      }
    ]
  },
};

export default nextConfig;