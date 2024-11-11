/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: 'standalone',
  experimental: {
    serverActions: {
      // 指定server action的安全域
      allowedOrigins: ['localhost', 'localhost:3000'],
    },
  },
}

export default nextConfig
