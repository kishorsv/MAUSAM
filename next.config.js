/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'openweathermap.org'],
    unoptimized: true,
  },
}

module.exports = nextConfig
