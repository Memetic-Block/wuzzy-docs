import * as path from 'node:path';
import { defineConfig } from 'rspress/config';
import { metaTags } from './head';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: metaTags.title,
  description: metaTags.description,
  icon: '/wuzzy.png',
  logo: {
    light: '/wuzzy.png',
    dark: '/wuzzy-dark.png',
  },
  globalStyles: path.join(__dirname, './styles/wuzzy.css'),
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/memetic-block/wuzzy-ao',
      },
    ],
  },

  head: [
    ['meta', { name: 'description', content: metaTags.description }],
    ['meta', { property: 'og:site_name', content: metaTags.title }],
    ['meta', { property: 'og:title', content: metaTags.title }],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      { property: 'og:image', content: 'https://wuzzy.io/wuzzy-og.png' },
    ],
    ['meta', { property: 'twitter:title', content: metaTags.title }],
    ['meta', { name: 'twitter:description', content: metaTags.description }],
    ['meta', { name: 'twitter:site', content: '@wuzzysearch' }],
    [
      'meta',
      { property: 'twitter:image', content: 'https://wuzzy.io/wuzzy-og.png' },
    ],
  ],
});
