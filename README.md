# Simple Icons Plugin for Obsidian

Associate beautiful Lucide icons with your markdown files and see them throughout the Obsidian interface. Icons can be assigned via frontmatter, tags, or folder paths.

## Features

- **Multiple Association Methods**: Configure icons using frontmatter properties, tags, or folder paths
- **Priority System**: Frontmatter > Tags > Folders (customize which methods are active)
- **Universal Rendering**: Icons appear in wikilinks, file views, tabs, file explorer, and search results
- **Full Lucide Icon Support**: Access to all Lucide icons available in Obsidian via the built-in icon system
- **Visual Icon Picker**: Search and select icons with a built-in picker
- **Performance Optimized**: Intelligent caching and efficient updates

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open Settings → Community Plugins
2. Search for "Simple Icons"
3. Click Install
4. Enable the plugin

### Manual Installation

1. Download the latest release from GitHub
2. Extract the files to `{VaultFolder}/.obsidian/plugins/simple-icons/`
3. Reload Obsidian
4. Enable the plugin in Settings → Community Plugins

## Usage

### Icon Association Methods

The plugin supports three methods for associating icons with files. You can enable or disable each method in the plugin settings.

#### 1. Frontmatter (Highest Priority)

Add an icon property to your file's frontmatter:

```yaml
---
icon: home
title: My Note
---
```

**Configuration:**

- Toggle: Enable/disable frontmatter icons
- Property Name: Customize the property name (default: `icon`)

**Example:**

```yaml
---
icon: book-open
tags: [reading, notes]
---
```

#### 2. Tags (Medium Priority)

Associate icons with tags in the plugin settings. If a file has multiple tags with icon mappings, the first matching tag (in your priority order) is used.

**Configuration:**

- Toggle: Enable/disable tag-based icons
- Add Mappings: Create tag → icon associations
- Reorder: Drag mappings up/down to set priority
- Delete: Remove unwanted mappings

**Example Setup:**

1. Create mapping: `project` → `folder`
2. Create mapping: `urgent` → `alert-circle`
3. Files tagged with `#urgent` will show the alert-circle icon
4. Files tagged with `#project` (but not `#urgent`) will show the folder icon

#### 3. Folders (Lowest Priority)

Associate icons with folder paths. Files inherit the icon from their deepest matching folder.

**Configuration:**

- Toggle: Enable/disable folder-based icons
- Add Mappings: Create folder path → icon associations
- Paths: Relative to vault root (e.g., `projects/work`)

**Example Setup:**

1. Create mapping: `daily-notes` → `calendar`
2. Create mapping: `daily-notes/2024` → `calendar-days`
3. Files in `daily-notes/2024/` will show `calendar-days`
4. Files in `daily-notes/2023/` will show `calendar`

### Priority Order

When multiple association methods are enabled, the plugin uses this priority order:

1. **Frontmatter** - If the file has an icon property
2. **Tags** - If the file has tags with icon mappings (first matching tag by priority)
3. **Folders** - If the file is in a folder with an icon mapping (deepest folder wins)

### Rendering Locations

Control where icons appear in the Obsidian interface:

#### Wikilinks

Icons appear next to wikilinks in:

- **Reading Mode**: Next to rendered links
- **Live Preview Mode**: Inside the brackets `[[icon filename]]`
- **Autofill Suggestions**: In the dropdown when typing `[[`

Toggle: Settings → "Render in wikilinks"

#### File View

Icons appear in:

- **Tab Headers**: Next to the filename in editor tabs
- **Inline Titles**: At the top of the editor

Toggle: Settings → "Render in file view"

#### File Lists

Icons appear in:

- **File Explorer**: Next to files in the sidebar
- **Search Results**: Next to matching files
- **Other File Lists**: Any built-in view that lists files

Toggle: Settings → "Render in file lists"

## Settings Reference

### Rendering Locations

| Setting              | Description                                                   | Default |
| -------------------- | ------------------------------------------------------------- | ------- |
| Render in wikilinks  | Show icons next to wikilinks in reading and live preview mode | ON      |
| Render in file view  | Show icons in tab headers and inline titles                   | ON      |
| Render in file lists | Show icons in file explorer and search results                | ON      |

### Icon Association Methods

#### Frontmatter

| Setting                   | Description                                     | Default |
| ------------------------- | ----------------------------------------------- | ------- |
| Enable frontmatter        | Allow specifying icons via frontmatter property | ON      |
| Frontmatter property name | The property to read icon names from            | `icon`  |

#### Tags

| Setting      | Description                                | Default |
| ------------ | ------------------------------------------ | ------- |
| Enable tags  | Allow associating icons with tags          | OFF     |
| Tag Mappings | List of tag → icon associations (sortable) | Empty   |

**Tag Mapping Controls:**

- **↑/↓ Arrows**: Reorder priority (top = highest priority)
- **Icon Preview**: Shows the current icon (for visual reference)
- **🗑️ Delete**: Remove mapping

#### Folders

| Setting         | Description                               | Default |
| --------------- | ----------------------------------------- | ------- |
| Enable folders  | Allow associating icons with folder paths | OFF     |
| Folder Mappings | List of folder path → icon associations   | Empty   |

**Folder Mapping Controls:**

- **Icon Preview**: Shows the current icon (for visual reference)
- **🗑️ Delete**: Remove mapping

## Finding Icon Names

### Using the Icon Picker

1. Open plugin settings
2. Add a new tag or folder mapping
3. Click the "Pick" button (or icon button if already set)
4. Search for an icon by name
5. Click to select

**Note:** The icon picker displays all available icons supported by Obsidian. You can also manually type any icon name if you know it.

Browse all available Lucide icons at: [lucide.dev/icons](https://lucide.dev/icons)

Common icon names:

- `home`, `folder`, `file`, `book`, `book-open`
- `calendar`, `calendar-days`, `clock`, `timer`
- `star`, `heart`, `bookmark`, `flag`
- `check`, `check-circle`, `x`, `alert-circle`
- `settings`, `user`, `users`, `mail`
- `code`, `terminal`, `database`, `server`

## Troubleshooting

### Icons not appearing

**Check the following:**

1. The association method is enabled (frontmatter/tags/folders)
2. The rendering location is enabled (wikilinks/file view/file lists)
3. The icon name is valid (use the icon picker or check [lucide.dev](https://lucide.dev))
4. The frontmatter property name matches your setting
5. For folders, check that the path is relative to vault root
6. Try reloading Obsidian (Cmd/Ctrl + R)

### Wrong icon showing

**The priority order is:**

1. Frontmatter (highest)
2. Tags (by order in settings)
3. Folders (deepest folder)

Check which method is providing the icon and adjust accordingly.

### Icons not updating after changes

**Trigger a refresh by:**

- Modifying the file (add/remove a space)
- Reloading Obsidian (Cmd/Ctrl + R)
- Toggling the plugin off and on

### Performance issues

The plugin uses intelligent caching and should be performant even with large vaults. If you experience slowdowns:

1. Disable unused rendering locations
2. Reduce the number of tag/folder mappings
3. Report an issue on GitHub with your vault size and usage details

## Development

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

This watches for changes and copies files to your vault automatically.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Built with [Obsidian API](https://github.com/obsidianmd/obsidian-api)
- Icons from [Lucide](https://lucide.dev) (ISC License)

## Support

- **Issues**: [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
- **Discussions**: [GitHub Discussions](https://github.com/iamJpRowan/obsidian-simple-icons/discussions)

---

**Note**: This plugin only modifies how files are displayed in the UI. It does not modify your markdown files (except when you edit frontmatter yourself).
