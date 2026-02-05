/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["themis128.github.io"],
  },
  eslint: {
    dirs: ["src"],
  },
};

module.exports = nextConfig;
