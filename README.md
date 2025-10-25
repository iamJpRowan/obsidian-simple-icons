# Obsidian Plugin Template

A minimal, production-ready template for developing Obsidian plugins with TypeScript.

## Features

- ✨ **Minimal Setup** - Just the essentials to get started
- 🔧 **TypeScript** - Full type safety with Obsidian API
- 🎨 **CSS Bundling** - Automatically collects and bundles all CSS files from your project
- 🔄 **Hot Reload** - Auto-copy to vault on file changes during development
- 📦 **Production Build** - Optimized builds with tree-shaking and minification
- 🚀 **GitHub Actions** - Automated releases with CI/CD
- 🔐 **Environment Variables** - Secure vault path management with `.env`

## Getting Started

### 1. Use This Template

Click the "Use this template" button on GitHub to create your own repository.

### 2. Clone Your Repository

```bash
git clone https://github.com/yourusername/your-plugin-name.git
cd your-plugin-name
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Your Plugin

Update the following files with your plugin information:

- `src/manifest.json` - Plugin ID, name, description, author
- `package.json` - Package name, description, author
- `LICENSE` - Your name and year

### 5. Set Up Development Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and set your vault plugin path:

```
VAULT_PLUGIN_PATH=/path/to/your/vault/.obsidian/plugins/your-plugin-id
```

**Example:**

```
VAULT_PLUGIN_PATH=/Users/username/Documents/MyVault/.obsidian/plugins/my-plugin
```

### 6. Start Development

```bash
npm run dev
```

This will:

- Watch for file changes
- Automatically compile and copy files to your vault
- Bundle all CSS files into a single `styles.css`

You'll need to reload Obsidian to see changes (Cmd/Ctrl + R).

### 7. Build for Production

```bash
npm run build
```

This creates optimized production files in your vault's plugin directory.

## Project Structure

```
.
├── src/
│   ├── main.ts          # Main plugin entry point
│   ├── manifest.json    # Plugin manifest
│   ├── types.ts         # Custom types and interfaces
│   └── styles.css       # Optional: main styles (auto-bundled)
├── .env                 # Environment variables (create from .env.example)
├── .env.example         # Example environment configuration
├── .eslintrc.json       # ESLint configuration
├── .gitignore           # Git ignore rules
├── .cursorignore        # Cursor ignore rules
├── esbuild.config.mjs   # Build configuration
├── package.json         # Package dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── version-bump.mjs     # Version management script
└── versions.json        # Version compatibility tracking
```

## CSS Bundling

The template includes automatic CSS bundling. Any `.css` files in your `src/` directory will be automatically collected and bundled into a single `styles.css` file in your vault's plugin directory.

**Example:**

```
src/
├── components/
│   ├── button.css
│   └── modal.css
└── views/
    └── sidebar.css
```

All these files will be bundled into a single `styles.css` with source comments for easy debugging.

## Version Management

To release a new version:

1. Update the version in `package.json`
2. Run `npm run version` to sync `manifest.json` and `versions.json`
3. Commit the changes
4. Create a git tag: `git tag -a 1.0.0 -m "Release 1.0.0"`
5. Push the tag: `git push origin 1.0.0`

The GitHub Action will automatically create a release with the built files.

## Publishing Your Plugin

### Automated Release (Recommended)

When you push a git tag, the GitHub Action automatically:

- Builds the plugin
- Creates a GitHub release
- Attaches `main.js`, `manifest.json`, and `styles.css`

### Manual Release

1. Run `npm run build`
2. Copy these files from your vault's plugin directory:
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. Create a release on GitHub and attach these files

### Submit to Community Plugins

Follow the [official Obsidian plugin submission guide](https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin).

## Development Tips

### Enable Hot Reload in Obsidian

Install the [Hot-Reload plugin](https://github.com/pjeby/hot-reload) for automatic plugin reloading during development.

### Debugging

Use the Developer Console (Cmd/Ctrl + Shift + I) to view console logs and errors.

### TypeScript Path Aliases

The template includes a `@/*` path alias pointing to `src/*`:

```typescript
// Instead of
import { MyClass } from "../../utils/myClass"

// You can write
import { MyClass } from "@/utils/myClass"
```

## Resources

- [Obsidian API Documentation](https://docs.obsidian.md/Home)
- [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Obsidian API on GitHub](https://github.com/obsidianmd/obsidian-api)
- [Community Plugins](https://github.com/obsidianmd/obsidian-releases/blob/master/community-plugins.json)

## License

MIT License - see [LICENSE](LICENSE) file for details.
