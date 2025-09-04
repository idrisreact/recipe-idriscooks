import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@react-pdf/renderer'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/300x400/png",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      '@react-pdf/renderer': 'commonjs @react-pdf/renderer',
    });
    
    // Handle ESM packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-pdf/renderer': require.resolve('@react-pdf/renderer'),
    };
    
    return config;
  },
};

export default nextConfig;
