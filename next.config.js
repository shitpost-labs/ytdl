/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['i.ytimg.com', 'picsum.photos'],
  },
  rewrites: async () => [
    {
      source: '/:path',
      has: [
        {
          type: 'query',
          key: 'v',
        }
      ],
      destination: '/api/vid?id=:v',
    },
    {
      source: '/:path',
      has: [
        {
          type: 'query',
          key: 'id',
        }
      ],
      destination: '/api/vid?id=:id',
    },
    {
      source: '/>path',
      has: [
        {
          type: 'query',
          key: 'url',
        }
      ],
      destination: '/api/dl?url=:url',
    },
    {
      source: '/:id',
      destination: '/api/vid?id=:id',
    }
  ],
}

module.exports = nextConfig
