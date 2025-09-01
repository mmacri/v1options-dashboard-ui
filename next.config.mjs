const isGithubPages = Boolean(process.env.GITHUB_PAGES)

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  ...(isGithubPages
    ? {
        output: 'export',
        basePath: '/v1options-dashboard-ui',
        trailingSlash: true,
      }
    : {}),
}

export default nextConfig