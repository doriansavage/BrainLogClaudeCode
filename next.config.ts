import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@whiskeysockets/baileys', '@hapi/boom', 'jimp', 'sharp'],
};

export default nextConfig;
