import * as path from 'node:path'
import { defineConfig } from 'rspress/config'
import { metaTags } from './head'

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: metaTags.title,
  description: metaTags.description,
  icon: '/wuzzy.png',
  logo: {
    light: '/wuzzy.png',
    dark: '/wuzzy-dark.png'
  },
  globalStyles: path.join(__dirname, './styles/wuzzy.css'),
  head: [
    ['meta', { name: 'description', content: metaTags.description }],
    ['meta', { name: 'keywords', content: metaTags.keywords.join(', ') }],
    ['meta', { property: 'og:title', content: metaTags.title }],
    ['meta', { property: 'og:description', content: metaTags.description }],
    ['meta', { property: 'og:type', content: 'website' }],
    [
      'meta',
      { property: 'og:image', content: 'https://wuzzy.io/wuzzy-og.png' },
    ],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: metaTags.title }],
    ['meta', { name: 'twitter:description', content: metaTags.description }],
    ['meta', { name: 'twitter:site', content: '@wuzzysearch' }],
    [
      'meta',
      { property: 'twitter:image', content: 'https://wuzzy.io/wuzzy-og.png' },
    ],
    // Block search engine indexing for dev and stage environments
    () => {
      const phase = process.env.PHASE || 'dev'
      if (phase === 'dev' || phase === 'stage') {
        return ['meta', { name: 'robots', content: 'noindex,nofollow' }]
      }
      // Allow indexing for live/production
      return undefined
    }
  ],
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/memetic-block/wuzzy-ao'
      }
    ]
  }
})
