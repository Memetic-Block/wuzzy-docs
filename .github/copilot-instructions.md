# Copilot Instructions for Wuzzy Docs

## Project Overview

This is the documentation site for **Wuzzy**, a permaweb search engine built on AO (Arweave). The site is built using [Rspress](https://rspress.dev/), a static site generator based on React and Rspack. Documentation is deployed to both Arweave (permanent storage) and Cloudflare Pages.

### Key Technologies

- **Rspress**: Static site generator for documentation
- **TypeScript**: Type-safe scripting and configuration
- **Arweave**: Permanent storage deployment via Turbo SDK
- **Cloudflare Pages**: Static site hosting alternative
- **Docker**: Containerized deployment workflow

## Project Structure

```
wuzzy-docs/
├── docs/               # Documentation content (Markdown/MDX)
│   ├── _meta.json     # Navigation configuration
│   ├── index.md       # Homepage
│   ├── api/           # API documentation
│   ├── guide/         # User guides
│   └── public/        # Static assets (images, fonts, etc.)
├── styles/            # Custom CSS styles
│   └── wuzzy.css     # Global styles
├── scripts/           # Deployment and utility scripts
│   ├── deploy.ts     # Arweave deployment script
│   └── logger.ts     # Logging utilities
├── operations/        # Deployment configuration files
├── doc_build/         # Built output directory (generated)
├── rspress.config.ts  # Rspress configuration
├── Dockerfile         # Container build configuration
└── package.json       # Dependencies and scripts
```

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready static site to `doc_build/`
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks
- `npm run format` - Format code with Prettier
- `npm run deploy:arweave` - Deploy to Arweave using Turbo SDK
- `npm run deploy:static` - Deploy to Cloudflare Pages using Wrangler

### Development Server

The dev server runs on the default Rspress port (usually http://localhost:5173) and provides:

- Hot module replacement
- Live content updates
- Fast refresh for React components

## Documentation Content

### File Structure

- All documentation lives in the `docs/` directory
- Use Markdown (`.md`) or MDX (`.mdx`) for content
- `_meta.json` files control navigation and ordering
- Static assets go in `docs/public/`

### Creating New Pages

1. Create a new `.md` or `.mdx` file in the appropriate directory
2. Add frontmatter if needed (e.g., for custom page types)
3. Update the corresponding `_meta.json` for navigation
4. Reference images/assets from `docs/public/`

### Navigation Configuration

Edit `docs/_meta.json` to configure top-level navigation. Each subdirectory can have its own `_meta.json` for nested navigation.

Example structure:

```json
[
  {
    "text": "Guide",
    "link": "/guide/",
    "activeMatch": "/guide/"
  }
]
```

## Configuration

### Rspress Config (`rspress.config.ts`)

- **root**: Points to `docs/` directory
- **title**: Site title ("Wuzzy Docs")
- **logo**: Light/dark mode logos
- **globalStyles**: Custom CSS file path
- **themeConfig**: Social links, navigation, etc.

### TypeScript Config (`tsconfig.json`)

- Target: ES2020
- Module: ESNext with bundler resolution
- Includes: docs, theme, and config files
- MDX support enabled

### ESLint Config (`eslint.config.mjs`)

- Uses flat config format
- TypeScript ESLint integration
- Browser globals
- Ignores `dist/` directory

## Deployment

### Arweave Deployment

The `scripts/deploy.ts` script handles permanent deployment to Arweave:

- Uses Turbo SDK for efficient uploads
- Deploys the entire `doc_build/` folder as a manifest
- Updates ANT (Arweave Name Token) records with new manifest ID
- Supports multiple environments (dev/stage/live)

**Required Environment Variables:**

- `ANT_PROCESS_ID`: Arweave Name Token process ID
- `PRIVATE_KEY`: Path to JWK file for signing
- `PHASE`: Deployment phase (dev/stage/live)
- `GATEWAY`: Arweave gateway URL (optional)

### Cloudflare Pages Deployment

Uses Wrangler CLI to deploy to Cloudflare Pages:

```bash
npm run deploy:static
```

Requires `PROJECT_NAME` environment variable.

### Docker Deployment

The Dockerfile sets up a Node.js Alpine environment with:

- Wrangler CLI pre-installed
- Build dependencies (Python, make, g++)
- rclone for file operations

## Code Style Guidelines

### TypeScript

- Use strict mode
- Prefer ES2020+ features
- Use explicit types where helpful
- Follow ESLint recommendations

### Markdown/MDX

- Use frontmatter for page metadata
- Follow consistent heading hierarchy
- Use code fences with language identifiers
- Keep lines reasonably short for readability

### File Naming

- Use kebab-case for Markdown files: `getting-started.md`
- Use PascalCase for React components (if any)
- Use camelCase for TypeScript files: `deploy.ts`

## Common Tasks

### Adding a New Guide

1. Create `docs/guide/your-guide.md`
2. Write content in Markdown
3. Update `docs/guide/_meta.json` to include the new page
4. Test locally with `npm run dev`

### Updating Styles

- Edit `styles/wuzzy.css` for global styles
- Changes apply automatically via `globalStyles` config
- Rspress uses CSS modules for component styles

### Updating Configuration

- Modify `rspress.config.ts` for site-wide settings
- Changes to config require server restart
- Logo files should be in `docs/public/`

### Testing Builds

1. Run `npm run build` to create production build
2. Check `doc_build/` for output
3. Run `npm run preview` to test locally
4. Verify all links and assets load correctly

## Important Notes

### Development Process

- Do not install dependencies. Instead, provide a summary of dependency updates to the user so they can manually install or remove before implementation begins.
- Do not modify package.json. Instead, provide a summary of changes to the user so they can manually update it before or after implementation.
- Do not run the app itself, the user will handle manual spot testing.
- Make sure the app compiles with `npm run build`.

### Asset Handling

- Assets in `docs/public/` are served from root (`/`)
- Reference them with absolute paths: `/wuzzy.png`
- Both light and dark logos are supported

### Build Output

- `doc_build/` directory is generated and should not be edited
- Contains static HTML, CSS, JS, and assets
- This directory is deployed to Arweave/Cloudflare

### Dependencies

- Rspress version: ^1.40.2 (keep updated for latest features)
- Deploy dependencies are dev-only (Turbo SDK, AR.IO SDK)
- Minimal runtime dependencies for fast builds

### Search Functionality

- Rspress includes built-in search
- Search index is generated at build time
- Located at `static/search_index.[hash].json`

## Troubleshooting

### Build Issues

- Clear `doc_build/` and rebuild: `rm -rf doc_build && npm run build`
- Check for invalid MDX syntax
- Verify all image paths are correct

### Navigation Issues

- Validate `_meta.json` syntax (must be valid JSON)
- Check that file paths match navigation links
- Ensure `activeMatch` patterns are correct

### Deployment Issues

- Verify environment variables are set
- Check JWK file path and permissions for Arweave deployment
- Ensure sufficient Turbo credits for Arweave uploads
- Verify PROJECT_NAME for Cloudflare deployment

## Additional Resources

- [Rspress Documentation](https://rspress.dev/)
- [Arweave Documentation](https://docs.arweave.org/)
- [Wuzzy GitHub Repository](https://github.com/memetic-block/wuzzy-ao)
- [Live Documentation](https://docs_wuzzy.arweave.net)
