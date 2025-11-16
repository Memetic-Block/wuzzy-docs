import { existsSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'

const BUILD_DIR = join(process.cwd(), 'doc_build')
const SITEMAP_PATH = join(BUILD_DIR, 'sitemap.xml')
const ROBOTS_PATH = join(BUILD_DIR, 'robots.txt')

interface SitemapUrl {
  loc: string
  lastmod: string
  changefreq: string
  priority: string
}

/**
 * Recursively find all HTML files in a directory
 */
function findHtmlFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []

  try {
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        files.push(...findHtmlFiles(fullPath, baseDir))
      } else if (stat.isFile() && item.endsWith('.html')) {
        files.push(fullPath)
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err)
  }

  return files
}

/**
 * Convert file path to URL path
 */
function filePathToUrl(filePath: string, baseDir: string): string {
  const relativePath = relative(baseDir, filePath)

  // Remove .html extension
  let urlPath = relativePath.replace(/\.html$/, '')

  // Convert index to root
  if (urlPath === 'index' || urlPath === '') {
    return '/'
  }

  // Handle nested index files
  if (urlPath.endsWith('/index')) {
    urlPath = urlPath.replace(/\/index$/, '')
  }

  // Ensure leading slash
  if (!urlPath.startsWith('/')) {
    urlPath = '/' + urlPath
  }

  return urlPath
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Get hostname based on PHASE environment variable
 */
function getHostname(): string {
  const phase = process.env.PHASE || 'dev'
  const hostname = process.env.HOSTNAME

  switch (phase) {
    case 'live':
      if (!hostname) {
        console.error(
          'ERROR: HOSTNAME environment variable is required for live deployments'
        )
        process.exit(1)
      }
      return hostname
    case 'stage':
      return hostname || 'docs-stage.wuzzy.io'
    case 'dev':
    default:
      return hostname || 'localhost:5173'
  }
}

/**
 * Determine if search engines should be blocked
 */
function shouldBlockRobots(): boolean {
  const phase = process.env.PHASE || 'dev'
  return phase === 'dev' || phase === 'stage'
}

/**
 * Generate sitemap.xml
 */
function generateSitemap(hostname: string): void {
  console.log('Generating sitemap.xml...')

  // Find all HTML files
  const htmlFiles = findHtmlFiles(BUILD_DIR)

  // Filter out 404.html and convert to URLs
  const urls: SitemapUrl[] = htmlFiles
    .filter((file) => !file.endsWith('404.html'))
    .map((file) => {
      const stat = statSync(file)
      const urlPath = filePathToUrl(file, BUILD_DIR)
      const lastmod = new Date(stat.mtime).toISOString()

      // Homepage gets priority 1.0, everything else gets 0.8
      const priority = urlPath === '/' ? '1.0' : '0.8'

      return {
        loc: `https://${hostname}${urlPath}`,
        lastmod,
        changefreq: 'weekly',
        priority
      }
    })

  // Generate XML
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((url) =>
      [
        '  <url>',
        `    <loc>${escapeXml(url.loc)}</loc>`,
        `    <lastmod>${url.lastmod}</lastmod>`,
        `    <changefreq>${url.changefreq}</changefreq>`,
        `    <priority>${url.priority}</priority>`,
        '  </url>'
      ].join('\n')
    ),
    '</urlset>'
  ].join('\n')

  writeFileSync(SITEMAP_PATH, xml, 'utf-8')
  console.log(`✓ Generated sitemap.xml with ${urls.length} URLs`)
}

/**
 * Generate robots.txt
 */
function generateRobotsTxt(hostname: string, blockRobots: boolean): void {
  console.log('Generating robots.txt...')

  let content: string

  if (blockRobots) {
    // Block all search engines for dev/stage
    content = ['User-agent: *', 'Disallow: /'].join('\n')
    console.log('✓ Generated robots.txt (blocking all crawlers for dev/stage)')
  } else {
    // Allow all search engines and reference sitemap for live
    content = [
      'User-agent: *',
      'Allow: /',
      '',
      `Sitemap: https://${hostname}/sitemap.xml`
    ].join('\n')
    console.log(
      '✓ Generated robots.txt (allowing crawlers with sitemap reference)'
    )
  }

  writeFileSync(ROBOTS_PATH, content, 'utf-8')
}

/**
 * Main function
 */
function main(): void {
  console.log('Starting SEO file generation...')
  console.log(`Phase: ${process.env.PHASE || 'dev'}`)

  // Validate that build directory exists
  if (!existsSync(BUILD_DIR)) {
    console.error(`ERROR: Build directory not found: ${BUILD_DIR}`)
    console.error('Please run "npm run build" before generating SEO files')
    process.exit(1)
  }

  // Validate that index.html exists
  const indexPath = join(BUILD_DIR, 'index.html')
  if (!existsSync(indexPath)) {
    console.error(`ERROR: Build output incomplete - ${indexPath} not found`)
    console.error('Please ensure "npm run build" completed successfully')
    process.exit(1)
  }

  const hostname = getHostname()
  const blockRobots = shouldBlockRobots()

  console.log(`Hostname: ${hostname}`)
  console.log(`Block robots: ${blockRobots}`)

  generateSitemap(hostname)
  generateRobotsTxt(hostname, blockRobots)

  console.log('✓ SEO file generation complete!')
}

// Run the script
main()
