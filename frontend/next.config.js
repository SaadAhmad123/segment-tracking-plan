/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    BUILD: process.env.BUILD,
    AWS_REGION: process.env.AWS_REGION,
    AWS_COGNITO_USERPOOL_CLIENT_ID: process.env.AWS_COGNITO_USERPOOL_CLIENT_ID,
  },
}

module.exports = nextConfig
