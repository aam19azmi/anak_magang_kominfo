import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  experimental: {
    allowedDevOrigins: ['http://192.168.11.2:3000'],
  },
};

export default nextConfig;
