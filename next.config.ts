import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'glb.asteroidstrike.earth',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
