/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@resvg/resvg-js'],
  webpack: (config) => {
    config.externals.push({
      '@resvg/resvg-js': 'commonjs @resvg/resvg-js',
    });
    return config;
  },
};

export default nextConfig;
