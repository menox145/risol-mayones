/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static optimization untuk API routes yang dynamic
  experimental: {
    isrMemoryCacheSize: 0,
  },
  // Suppress Vercel warnings
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60, // ISR for 1 hour
    pagesBufferLength: 5,
  },
};

module.exports = nextConfig;