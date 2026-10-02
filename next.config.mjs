import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
      encoding: false,
      'firebase/app': path.resolve('./node_modules/firebase/app/dist/esm/index.esm.js'),
      'firebase/auth': path.resolve('./node_modules/firebase/auth/dist/esm/index.esm.js'),
      'firebase/firestore': path.resolve('./node_modules/firebase/firestore/dist/esm/index.esm.js'),
    };
    return config;
  },
};

export default nextConfig;
