import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/pixel-generator' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/pixel-generator' : '',
};

export default nextConfig;
