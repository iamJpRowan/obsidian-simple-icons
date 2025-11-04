# Contributing to Simple Icons

Thank you for your interest in contributing! This guide provides a quick overview of how to get started.

## Quick Links

- **[Quick Dev Start Guide](GETTING-STARTED-DEV.md)** - ⭐ Start here for development setup
- **[Documentation Structure](DOCUMENTATION_STRUCTURE.md)** - Guide to all documentation
- **[Development Log](devlog/)** - Architecture decisions and implementation details

## Getting Started

### 1. Set up your development environment

Follow the [Quick Dev Start Guide](GETTING-STARTED-DEV.md) to:
- Clone the repository
- Install dependencies
- Configure your vault path in `.env`
- Start development mode
- Enable the plugin in Obsidian

### 2. Find something to work on

- Browse [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues) for open tasks
- Look for issues tagged `good-first-issue` if you're new
- Comment on an issue to let others know you're working on it

### 3. Make your changes

- Edit files in `src/`
- The plugin will auto-rebuild on save
- Reload Obsidian (Ctrl/Cmd + R) to see changes
- Test thoroughly before submitting

### 4. Submit a pull request

- Commit your changes with clear commit messages
- Push to your fork
- Open a pull request with a description of your changes
- Link to any related issues

## Code Quality Standards

### Before Submitting

Run these checks to ensure your code meets quality standards:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format

# Build verification
npm run build
```

### Pre-commit Hooks

The project uses Husky and lint-staged to automatically:
- Run ESLint and fix issues
- Format code with Prettier
- Ensure code quality before commit

These run automatically when you commit, but you can also run them manually.

## Commit Message Guidelines

Use clear, descriptive commit messages following conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no functional changes)
- `refactor:` Code refactoring (no functional changes)
- `test:` Test changes
- `chore:` Build process or tooling changes

**Examples:**
```
feat: add folder icon inheritance
fix: resolve icon caching issue in file explorer
docs: update installation instructions
refactor: simplify icon resolution logic
```

## Project Structure

Understanding the codebase:

```
src/
├── main.ts                 # Plugin entry point
├── types.ts                # TypeScript types
├── IconResolver.ts         # Icon resolution logic
├── IconRenderer.ts         # Rendering coordinator
├── IconElementFactory.ts   # Icon DOM creation
├── IconPickerModal.ts      # Icon picker UI
├── EditorExtension.ts      # CodeMirror 6 extension
├── ObserverManager.ts      # Observer lifecycle
├── SettingsTab.ts          # Settings UI
├── renderers/              # Location-specific renderers
│   ├── WikilinkRenderer.ts
│   ├── FileViewRenderer.ts
│   ├── FileListRenderer.ts
│   ├── MetadataRenderer.ts
│   └── SuggestionRenderer.ts
├── styles.css              # Plugin styles
└── manifest.json           # Plugin metadata
```

For detailed architecture information, see the [Development Log](devlog/).

## Testing Your Changes

### Manual Testing Checklist

Minimal smoke test:
- [ ] Create file with frontmatter icon
- [ ] Check icon appears in file explorer
- [ ] Create wikilink to file
- [ ] Check icon appears in wikilink (reading & live preview)
- [ ] Check icon appears in tab header
- [ ] Check icon appears in inline title
- [ ] No console errors

For comprehensive testing, see `docs/testing.md`.

### Debugging

Open Obsidian DevTools (Ctrl/Cmd + Shift + I):
- **Console**: See logs and errors
- **Elements**: Inspect icon DOM elements
- **Network**: Monitor resource loading
- **Performance**: Profile rendering speed

Check plugin status in console:
```javascript
app.plugins.plugins['simple-icons']
```

## Development Workflow

### Adding a New Renderer

1. Create `src/renderers/YourRenderer.ts`
2. Export from `src/renderers/index.ts`
3. Register in `src/IconRenderer.ts`
4. Add tests and documentation

### Adding a Setting

1. Update `SimpleIconsSettings` in `src/types.ts`
2. Update `DEFAULT_SETTINGS` in `src/types.ts`
3. Add UI in `src/SettingsTab.ts`
4. Update documentation

### Modifying Icon Resolution

1. Edit `src/IconResolver.ts`
2. Update priority logic or add new methods
3. Invalidate cache appropriately
4. Update documentation and tests

### Changing Icon Appearance

1. Edit `src/IconElementFactory.ts` for DOM structure
2. Edit `src/styles.css` for styling
3. Test across all rendering locations

## Documentation

### Keep Documentation Current

When making code changes:
- [ ] Update relevant documentation files
- [ ] Add devlog entry for significant changes
- [ ] Update code examples if affected
- [ ] Check for broken links

### Documentation Standards

- **Clear**: Use simple, direct language
- **Concise**: Get to the point quickly
- **Complete**: Include all necessary information
- **Current**: Keep in sync with code changes
- **Accessible**: Assume minimal prior knowledge

See [Documentation Structure](DOCUMENTATION_STRUCTURE.md) for guidelines.

## Release Process

Maintainers handle releases, but here's the process:

1. Update version in `package.json`
2. Run `npm run version` to sync manifest and versions.json
3. Update `CHANGELOG.md` with changes
4. Commit: `git commit -am "chore: bump version to x.x.x"`
5. Create tag: `git tag vx.x.x`
6. Push: `git push && git push --tags`
7. GitHub Actions automatically creates the release

## Getting Help

- **Questions**: [GitHub Discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- **Documentation**: [docs/](docs/) directory
- **Architecture Details**: [devlog/](devlog/) directory

## Code of Conduct

- Be respectful and constructive
- Focus on the code, not the person
- Help create a welcoming environment for everyone
- Follow GitHub's Community Guidelines

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

For detailed development information, see the [Quick Dev Start Guide](GETTING-STARTED-DEV.md) and [Development Log](devlog/).
