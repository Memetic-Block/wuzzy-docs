import * as path from 'node:path'
import { defineConfig } from 'rspress/config'

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Wuzzy Docs',
  icon: '/wuzzy.png',
  logo: {
    light: '/wuzzy.png',
    dark: '/wuzzy-dark.png'
  },
  globalStyles: path.join(__dirname, './styles/wuzzy.css'),
  head: [
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
