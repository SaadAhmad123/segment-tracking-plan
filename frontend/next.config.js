/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BUILD: process.env.BUILD,
    REGION: process.env.REGION,
    COGNITO_USERPOOL_CLIENT_ID: process.env.COGNITO_USERPOOL_CLIENT_ID,
  },
}

module.exports = nextConfig
