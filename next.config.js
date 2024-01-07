/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'picsum.photos'],
  },
  rewrites: async () => [
    {
      source: '/:id',
      destination: '/api/vid?id=:id',
    }
  ],
}

module.exports = nextConfig
