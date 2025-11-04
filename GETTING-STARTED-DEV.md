# Quick Dev Start Guide

⭐ **Start here for development** - Get up and running in 5 minutes.

## Prerequisites

- **Node.js** v14 or higher
- **npm** (comes with Node.js)
- **Obsidian** installed
- A test vault for development

## Quick Setup

### 1. Clone the repository

```bash
git clone https://github.com/iamJpRowan/obsidian-simple-icons.git
cd obsidian-simple-icons
```

> **Tip**: You can clone anywhere - the build process will copy files to your vault.

### 2. Install dependencies

```bash
npm install
```

This installs TypeScript, esbuild, and other development dependencies.

### 3. Configure your vault path

Copy the example environment file and update it:

```bash
cp .env.example .env
# Then edit .env with your vault path
```

Or create a `.env` file directly:

```bash
echo "VAULT_PATH=/path/to/your/test-vault" > .env
```

Replace with the actual path to your Obsidian test vault. The plugin will automatically be built to `{VAULT_PATH}/.obsidian/plugins/simple-icons`.

> **Tip**: Use a dedicated test vault, not your main vault, for development.

### 4. Start development mode

```bash
npm run dev
```

This starts esbuild in watch mode. It will automatically rebuild the plugin and copy files to your vault whenever you save changes.

**Output looks like:**
```
[watch] build finished, watching for changes...
```

The plugin files will be automatically copied to your vault's plugin directory.

### 5. Enable plugin in Obsidian

1. Open your test vault in Obsidian
2. Go to **Settings** → **Community Plugins**
3. Click **"Turn on community plugins"** (disable restricted mode if needed)
4. Find **"Simple Icons"** in the list
5. Toggle it **ON**

### 6. Start developing!

You're all set! Here's the workflow:

1. **Edit TypeScript files** in `src/`
2. **Save** - esbuild automatically rebuilds (watch terminal for "build finished")
3. **Reload Obsidian** (Ctrl/Cmd + R) to see changes
4. **Test** your changes
5. Repeat!

## Project Structure

```
obsidian-simple-icons/
├── src/                        # ← Edit these files
│   ├── main.ts                 # Plugin entry point
│   ├── types.ts                # TypeScript types
│   ├── IconResolver.ts         # Icon resolution logic
│   ├── IconRenderer.ts         # Rendering coordinator
│   ├── IconElementFactory.ts   # Icon DOM creation
│   ├── IconPickerModal.ts      # Icon picker UI
│   ├── EditorExtension.ts      # CodeMirror 6 extension
│   ├── ObserverManager.ts      # Observer lifecycle
│   ├── SettingsTab.ts          # Settings UI
│   ├── renderers/              # Location-specific renderers
│   │   ├── WikilinkRenderer.ts
│   │   ├── FileViewRenderer.ts
│   │   ├── FileListRenderer.ts
│   │   ├── MetadataRenderer.ts
│   │   └── SuggestionRenderer.ts
│   ├── styles.css              # Plugin styles
│   └── manifest.json           # Plugin metadata
│
├── main.js                     # ← Built file (don't edit)
├── styles.css                  # ← Built file (don't edit)
├── manifest.json               # ← Built file (don't edit)
│
├── docs/                       # Documentation
├── devlog/                     # Development log
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
└── esbuild.config.mjs          # Build config
```

## Development Workflow

### Making Changes

1. **Open `src/` in your editor** (VS Code, Cursor, etc.)
2. **Make changes** to TypeScript files
3. **Check terminal** - should show "build finished"
4. **Reload Obsidian** - Ctrl/Cmd + R
5. **Test changes** - Open DevTools (Ctrl/Cmd + Shift + I) to see console

### Debugging

**Console Logging:**
```typescript
console.log('Icon resolved:', iconName);
console.warn('Invalid icon name:', iconName);
console.error('Failed to render:', error);
```

**Obsidian DevTools:**
- Open: **Ctrl/Cmd + Shift + I**
- **Console**: See logs and errors
- **Elements**: Inspect icon DOM elements
- **Network**: Monitor resource loading
- **Performance**: Profile rendering speed

**Check Plugin Status:**
```javascript
// In DevTools console
app.plugins.plugins['simple-icons']
```

### Common Tasks

**Add a new renderer:**
1. Create `src/renderers/YourRenderer.ts`
2. Export from `src/renderers/index.ts`
3. Register in `src/IconRenderer.ts`

**Add a setting:**
1. Update `SimpleIconsSettings` in `src/types.ts`
2. Update `DEFAULT_SETTINGS` in `src/types.ts`
3. Add UI in `src/SettingsTab.ts`

**Modify icon resolution:**
1. Edit `src/IconResolver.ts`
2. Update priority logic or add new methods

**Change icon appearance:**
1. Edit `src/IconElementFactory.ts` for DOM structure
2. Edit `src/styles.css` for styling

## Testing Changes

### Quick Test

Minimal smoke test:
1. [ ] Create file with frontmatter icon
2. [ ] Check icon appears in file explorer
3. [ ] Create wikilink to file
4. [ ] Check icon appears in wikilink
5. [ ] Check icon appears in tab
6. [ ] No console errors

### Full Test

See [Testing Guide](docs/testing.md) for comprehensive checklist.

## Building for Release

### Development Build

```bash
npm run build
```

Creates optimized production build.

### Version Update

1. Update version in:
   - `manifest.json`
   - `package.json`
   - `versions.json`

2. Update `CHANGELOG.md`

3. Create git tag:
```bash
git tag -a 1.0.1 -m "Release version 1.0.1"
git push origin 1.0.1
```

## Troubleshooting

### Build not updating

- Check terminal for build errors
- Try stopping (Ctrl+C) and restarting `npm run dev`
- Delete `main.js` and rebuild

### Plugin not loading

- Check Obsidian console for errors
- Verify `manifest.json` is valid
- Check plugin is enabled in settings
- Try disabling and re-enabling

### Changes not appearing

- Make sure you reloaded Obsidian (Ctrl/Cmd + R)
- Check build actually completed (watch terminal)
- Clear Obsidian cache (restart with Ctrl/Cmd + R)

### TypeScript errors

- Run `npm install` to ensure dependencies are up-to-date
- Check `tsconfig.json` is correct
- Verify TypeScript version: `npx tsc --version`

## Next Steps

### Learn More

- **[Full Contributing Guide](docs/contributing.md)** - Detailed development guide
- **[Development Log](devlog/)** - Architecture decisions and implementation details
- **[Testing Guide](docs/testing.md)** - Comprehensive testing checklist

### Make Your First Contribution

1. Pick an issue from [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
2. Comment that you're working on it
3. Follow the development workflow above
4. Submit a pull request

### Get Help

- **Questions**: [GitHub Discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
- **Issues**: [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- **Documentation**: [docs/](docs/)

---

**Happy coding!** 🚀

For detailed information, see the [full Contributing Guide](docs/contributing.md).

