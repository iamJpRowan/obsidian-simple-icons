# Contributing to Simple Icons

Thank you for your interest in contributing! This guide will help you get started with development.

## Development Setup

### Prerequisites

- **Node.js** v14 or higher
- **npm** (comes with Node.js)
- **Obsidian** installed
- A test vault for development

### Quick Start

1. **Clone the repository** into your test vault's plugin folder:

```bash
cd /path/to/your/vault/.obsidian/plugins
git clone https://github.com/iamJpRowan/obsidian-simple-icons.git
cd obsidian-simple-icons
```

2. **Install dependencies**:

```bash
npm install
```

3. **Start development mode** (auto-rebuild on changes):

```bash
npm run dev
```

4. **Enable the plugin** in Obsidian:
   - Open **Settings** → **Community Plugins**
   - Find **Simple Icons** and toggle it on
   - Reload Obsidian (Ctrl/Cmd + R) after code changes

## Project Structure

```
obsidian-simple-icons/
├── src/
│   ├── main.ts                 # Plugin entry point
│   ├── types.ts                # TypeScript interfaces
│   ├── IconResolver.ts         # Icon resolution logic
│   ├── IconRenderer.ts         # Main renderer coordinator
│   ├── IconElementFactory.ts   # DOM element creation
│   ├── IconPickerModal.ts      # Icon picker UI
│   ├── EditorExtension.ts      # CodeMirror 6 extension
│   ├── ObserverManager.ts      # MutationObserver manager
│   ├── SettingsTab.ts          # Plugin settings UI
│   ├── renderers/              # Specialized renderers
│   │   ├── WikilinkRenderer.ts      # Wikilink rendering
│   │   ├── FileViewRenderer.ts      # Tab/title rendering
│   │   ├── FileListRenderer.ts      # Explorer rendering
│   │   ├── MetadataRenderer.ts      # Frontmatter parsing
│   │   ├── SuggestionRenderer.ts    # Autocomplete
│   │   └── index.ts                 # Exports
│   ├── styles.css              # Plugin styles
│   └── manifest.json           # Plugin metadata
├── docs/                       # Documentation
├── devlog/                     # Development log
├── esbuild.config.mjs          # Build configuration
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## Development Workflow

### Making Changes

1. **Edit TypeScript files** in `src/`
2. **Save** - esbuild automatically rebuilds
3. **Reload Obsidian** (Ctrl/Cmd + R) to see changes
4. **Test** your changes thoroughly

### Adding a New Renderer

To add icons to a new location in Obsidian:

1. **Create renderer class** in `src/renderers/YourRenderer.ts`:

```typescript
import { IconRenderer } from '../IconRenderer';

export class YourRenderer {
    constructor(private renderer: IconRenderer) {}

    register(): void {
        // Set up DOM monitoring or event listeners
        // Call this.renderer.resolveIcon(file) to get icons
        // Use this.renderer.factory.create() to make icon elements
    }

    unregister(): void {
        // Clean up event listeners and observers
    }
}
```

2. **Export from index**:

```typescript
// src/renderers/index.ts
export { YourRenderer } from './YourRenderer';
```

3. **Register in main plugin**:

```typescript
// src/main.ts or IconRenderer.ts
this.yourRenderer = new YourRenderer(this);
this.yourRenderer.register();
```

### Adding Settings

1. **Update types** in `src/types.ts`:

```typescript
export interface SimpleIconsSettings {
    // ... existing settings
    yourNewSetting: boolean;
}

export const DEFAULT_SETTINGS: SimpleIconsSettings = {
    // ... existing defaults
    yourNewSetting: false,
};
```

2. **Add UI in SettingsTab**:

```typescript
// src/SettingsTab.ts
new Setting(containerEl)
    .setName('Your Setting Name')
    .setDesc('Description of what it does')
    .addToggle(toggle => toggle
        .setValue(this.plugin.settings.yourNewSetting)
        .onChange(async (value) => {
            this.plugin.settings.yourNewSetting = value;
            await this.plugin.saveSettings();
            // Trigger any necessary updates
        }));
```

## Coding Standards

### TypeScript

- Use **TypeScript** for all code
- Enable strict type checking
- Avoid `any` types when possible
- Document complex functions with JSDoc comments

### Code Style

- **Indentation**: Tabs (follow Obsidian's convention)
- **Line length**: 120 characters max
- **Naming**:
  - Classes: `PascalCase`
  - Methods/Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Private members: prefix with `private`

### Example

```typescript
export class ExampleRenderer {
    private observer: MutationObserver | null = null;

    constructor(private renderer: IconRenderer) {}

    /**
     * Initialize the renderer and start monitoring
     */
    register(): void {
        this.setupObserver();
    }

    private setupObserver(): void {
        // Implementation
    }

    unregister(): void {
        this.observer?.disconnect();
        this.observer = null;
    }
}
```

## Testing

### Manual Testing

Test your changes across:

1. **File types**: Regular notes, canvas, excalidraw
2. **Locations**: Wikilinks, tabs, explorer, search
3. **Methods**: Frontmatter, tags, folders
4. **Edge cases**:
   - Files without icons
   - Invalid icon names
   - Files with multiple tags
   - Nested folders
   - Special characters in filenames

### Performance Testing

Test with:
- Small vaults (<100 files)
- Medium vaults (100-1000 files)
- Large vaults (>1000 files)

Watch for:
- UI lag when opening files
- Slow icon updates
- Memory leaks (check DevTools)

## Building for Release

### Production Build

```bash
npm run build
```

This creates optimized files in the project root:
- `main.js` - Minified plugin code
- `styles.css` - Plugin styles
- `manifest.json` - Plugin metadata

### Version Management

1. **Update version** in:
   - `manifest.json`
   - `package.json`
   - `versions.json`

2. **Update CHANGELOG.md** with changes

3. **Create git tag**:

```bash
git tag -a 1.0.0 -m "Release version 1.0.0"
git push origin 1.0.0
```

## Submitting Changes

### Pull Request Process

1. **Fork** the repository
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** with clear commits
4. **Test thoroughly**
5. **Update documentation** if needed
6. **Submit pull request** with:
   - Clear title
   - Description of changes
   - Related issue numbers
   - Testing performed

### Commit Messages

Use clear, descriptive commit messages:

```
Good:
- Add folder icon support to file explorer
- Fix icon not updating when tag changes
- Improve performance with icon caching

Bad:
- Fixed bug
- Update code
- Changes
```

## Getting Help

- **Documentation**: Check [docs/](.)
- **Development log**: See [devlog/](../devlog) for architecture decisions
- **Questions**: Open a [GitHub Discussion](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)
- **Bugs**: Report on [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)

## Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on what's best for the community
- Show empathy toward others

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Simple Icons! 🎉

