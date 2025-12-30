import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mencegah error saat menggunakan library AI di sisi server
  serverExternalPackages: ['@xenova/transformers'],
};

export default nextConfig;
