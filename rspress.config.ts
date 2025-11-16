import * as path from 'node:path'
import { defineConfig } from 'rspress/config'
import { siteTitle, siteDescription, siteKeywords } from './head'

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Wuzzy Docs',
  description: siteDescription,
  icon: '/wuzzy.png',
  logo: {
    light: '/wuzzy.png',
    dark: '/wuzzy-dark.png'
  },
  globalStyles: path.join(__dirname, './styles/wuzzy.css'),
  head: [
    ['meta', { name: 'keywords', content: siteKeywords.join(', ') }],
    ['meta', { property: 'og:title', content: siteTitle }],
    ['meta', { property: 'og:description', content: siteDescription }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:title', content: siteTitle }],
    ['meta', { name: 'twitter:description', content: siteDescription }],
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
