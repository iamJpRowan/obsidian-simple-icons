# Changelog

All notable changes to Simple Icons plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation structure
- Developer guides and contributing guidelines
- Development log with architecture decisions

### Changed
- Improved documentation organization

### Fixed
- None

## [1.0.0] - 2024-11-03

### Added
- Initial release of Simple Icons plugin
- Frontmatter-based icon association (`icon:` property)
- Tag-based icon association with priority ordering
- Folder-based icon association with depth priority
- Icon rendering in multiple locations:
  - Wikilinks (reading mode, live preview, source mode)
  - File view (tabs, inline titles)
  - File lists (explorer, search results)
  - Autocomplete suggestions
- Visual icon picker with search functionality
- Full Lucide icon library support
- Configurable property name for frontmatter icons
- Toggle switches for each association method
- Toggle switches for each rendering location
- Priority system: Frontmatter > Tags > Folders
- Performance optimizations:
  - Icon resolution caching
  - Observer management
  - Efficient DOM queries
- Settings UI with drag-and-drop tag priority
- Tag and folder mapping management
- Icon preview in settings

### Technical
- TypeScript implementation
- Modular renderer architecture
- CodeMirror 6 integration for live preview
- MutationObserver-based DOM monitoring
- Obsidian metadata cache integration
- Efficient caching system

## Release Notes

### [1.0.0] - Initial Release

This is the initial public release of Simple Icons plugin for Obsidian.

**Key Features:**
- Associate icons with your markdown files using three flexible methods
- See icons throughout Obsidian's interface
- Full control over where and how icons appear
- Built on Obsidian's native Lucide icon system
- Performance-optimized for large vaults

**Getting Started:**
- Install from Community Plugins (coming soon) or manually
- See [Quick Start Guide](docs/quickstart.md) for setup
- Check [Documentation](docs/) for detailed usage

**Known Limitations:**
- Icons tested up to 5000 files (larger vaults may vary)
- Mobile support is functional but UI may differ
- Some third-party plugins may have conflicts

**Feedback:**
- Report issues: [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- Discussions: [GitHub Discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)

---

## Version History Summary

- **1.0.0** (2024-11-03) - Initial release

---

[Unreleased]: https://github.com/iamJpRowan/obsidian-simple-icons/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/iamJpRowan/obsidian-simple-icons/releases/tag/v1.0.0

