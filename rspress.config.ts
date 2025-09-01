import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Wuzzy Docs',
  icon: '/wuzzy.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
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
});
