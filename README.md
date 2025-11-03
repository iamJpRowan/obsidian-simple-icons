# Simple Icons Plugin for Obsidian

Associate beautiful icons with your markdown files and see them throughout the Obsidian interface. Icons can be assigned via frontmatter, tags, or folder paths.

![GitHub release](https://img.shields.io/github/v/release/iamJpRowan/obsidian-simple-icons)
![License](https://img.shields.io/github/license/iamJpRowan/obsidian-simple-icons)

## Features

- ✨ **Multiple Association Methods**: Configure icons using frontmatter properties, tags, or folder paths
- 🎯 **Priority System**: Frontmatter > Tags > Folders (customize which methods are active)
- 🌍 **Universal Rendering**: Icons appear in wikilinks, file views, tabs, file explorer, and search results
- 🎨 **Full Lucide Icon Support**: Access to all Lucide icons available in Obsidian
- 🔍 **Visual Icon Picker**: Search and select icons with a built-in picker
- ⚡ **Performance Optimized**: Intelligent caching and efficient updates for large vaults

## Quick Start

### Installation

#### From Obsidian Community Plugins (Coming Soon)

1. Open **Settings** → **Community Plugins**
2. Search for **"Simple Icons"**
3. Click **Install** and enable

#### Manual Installation

1. Download the latest release from [GitHub](https://github.com/iamJpRowan/obsidian-simple-icons/releases)
2. Extract to `{VaultFolder}/.obsidian/plugins/simple-icons/`
3. Reload Obsidian
4. Enable in **Settings** → **Community Plugins**

**See [Quick Start Guide](docs/quickstart.md) for detailed setup.**

### Quick Usage

**Frontmatter** (simplest):
```yaml
---
icon: home
---
```

**Tags** (categorical):
- Settings → Enable tags → Add mapping: `project` → `folder`
- Any file with `#project` shows folder icon

**Folders** (location-based):
- Settings → Enable folders → Add mapping: `daily-notes` → `calendar`
- All files in `daily-notes/` show calendar icon

**See [Icon Reference](docs/icon-reference.md) for complete usage guide.**

## Where Icons Appear

Icons automatically show in:
- ✅ Wikilinks (reading mode, live preview, source mode)
- ✅ Tab headers and inline titles
- ✅ File explorer
- ✅ Search results
- ✅ Autocomplete suggestions

Toggle each location on/off in settings.

## Priority Order

When multiple methods assign icons:
1. **Frontmatter** - Direct file specification (highest priority)
2. **Tags** - First matching tag in your priority list
3. **Folders** - Deepest matching folder (lowest priority)

## Finding Icons

- **Icon Picker**: Click "Pick" in settings to search visually
- **Browse**: Visit [lucide.dev/icons](https://lucide.dev/icons)
- **Common icons**: `home`, `folder`, `star`, `book`, `calendar`, `check`, `code`, `heart`

## Documentation

### 📚 For Users

- **[Quick Start Guide](docs/quickstart.md)** - ⭐ Get up and running in 5 minutes
- **[Icon Reference](docs/icon-reference.md)** - Complete usage guide
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

### 🔧 For Developers

- **[Quick Dev Start](GETTING-STARTED-DEV.md)** - ⭐ Get development environment running
- **[Contributing Guide](docs/contributing.md)** - How to contribute
- **[Testing Guide](docs/testing.md)** - Testing guidelines
- **[Development Log](devlog/)** - Design decisions and implementation details

### 📖 Project Info

- **[Changelog](CHANGELOG.md)** - Version history and release notes
- **[Documentation Structure](DOCUMENTATION_STRUCTURE.md)** - Guide to all documentation

## Development

### Quick Start

```bash
# Clone into test vault's plugin folder
cd /path/to/vault/.obsidian/plugins
git clone https://github.com/iamJpRowan/obsidian-simple-icons.git
cd obsidian-simple-icons

# Install and start development
npm install
npm run dev

# Enable in Obsidian and reload (Ctrl/Cmd + R) after changes
```

**See [Quick Dev Start Guide](GETTING-STARTED-DEV.md) for detailed instructions.**

### Build

```bash
npm run build
```

## Contributing

Contributions are welcome! Whether you:
- 🐛 Found a bug → [Report it](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- 💡 Have an idea → [Discuss it](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
- 📝 Want to improve docs → Submit a PR
- 💻 Want to code → See [Contributing Guide](docs/contributing.md)

**Quick contribution steps:**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and test thoroughly
4. Update documentation if needed
5. Submit pull request

**See [Contributing Guide](docs/contributing.md) for details.**

## Troubleshooting

**Icons not appearing?**
- Check method is enabled (frontmatter/tags/folders)
- Check rendering is enabled (wikilinks/file view/file lists)
- Verify icon name at [lucide.dev](https://lucide.dev)
- Try reloading Obsidian (Ctrl/Cmd + R)

**See [Troubleshooting Guide](docs/troubleshooting.md) for more help.**

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
- 📖 **Documentation**: [docs/](docs/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Built with [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- Icons from [Lucide](https://lucide.dev) (ISC License)

---

**Note**: This plugin only modifies how files are displayed in the UI. It does not modify your markdown files (except when you edit frontmatter yourself).

⭐ **Star this repo** if you find it useful!
