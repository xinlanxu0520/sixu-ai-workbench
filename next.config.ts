import type { NextConfig } from 'next';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repositoryBasePath = '/sixu-ai-workbench';

const nextConfig: NextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  assetPrefix: isGitHubPages ? repositoryBasePath : '',
  trailingSlash: isGitHubPages,
};

export default nextConfig;
