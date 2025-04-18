import withBundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';
// import createNextIntlPlugin = require('next-intl/plugin');
import { composePlugins, withNx } from '@nx/next';
import type { NextConfig } from 'next';
import { WithNxOptions } from '@nx/next/plugins/with-nx';
import path from 'path';
import { AppConfig } from './src/utils/AppConfig';
// import * as path from 'path';
// import withBundleAnalyzer = require('@next/bundle-analyzer');

const withNextIntl = createNextIntlPlugin('./src/libs/i18n.ts');

const withBundleAnalyzerValue = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export const basePath = process.env.NEXTJS_BASE_PATH || undefined;

const nextConfig: WithNxOptions & NextConfig = {
  basePath,
  trailingSlash: true,
  async redirects() {
    return [
      // {
      //   source: '/',
      //   destination: '/en/',
      //   permanent: true,
      //   basePath: false,
      // },
    ];
  },
  assetPrefix: process.env.NEXTJS_CDN_URL || undefined,
  output: 'standalone',
  distDir: '../../dist/apps/demo-nextjs/.next',
  outputFileTracingRoot: path.join(__dirname, '../../../'),
  //  assetPrefix: CDN
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  experimental: {},
  async rewrites() {
    return {
      beforeFiles: [],
      fallback: [],
      afterFiles: [
        // {
        //   source: '/',
        //   destination: `/en/`,
        // },
        // {
        //   source: `/${basePath}`,
        //   destination: `/${basePath}/en/`,
        // },
        // ...AppConfig.locales.map((locale) => {
        //   return {
        //     source: `/${locale}`,
        //     destination: `${basePath}/${locale}/`,
        //   };
        // }),
      ],
    };
  },

  nx: {
    svgr: false,
  },
  serverExternalPackages: ['sequelize', 'pino', 'pino-pretty'],
  eslint: {
    dirs: ['.'],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNextIntl,
  withBundleAnalyzerValue,
  withNx,
  // withMDX,
];
const composePluginsValue = composePlugins(...plugins);
export default composePluginsValue(nextConfig);
