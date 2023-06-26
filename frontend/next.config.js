const withPWA = require('next-pwa')({
  dest: 'public',
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    domains: [
      'localhost',
    ],
    minimumCacheTTL: 60,
    disableStaticImages: true,
  },
  env: {
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
    SITE_NAME: process.env.SITE_NAME,
  },
}

module.exports = withPWA(nextConfig);
