import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/300x400/png",
      },
    ],
  },
  webpack: (config) => {
    config.externals = config.externals || [];
    config.externals.push({
      '@react-pdf/renderer': 'commonjs @react-pdf/renderer',
    });
    return config;
  },
};

export default nextConfig;
