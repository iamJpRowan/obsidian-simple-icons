# Quick Start Guide

Get up and running with Simple Icons in 5 minutes.

## Installation

### From Obsidian Community Plugins (Coming Soon)

1. Open **Settings** → **Community Plugins**
2. Search for **"Simple Icons"**
3. Click **Install**
4. Enable the plugin

### Manual Installation

1. Download the latest release from [GitHub](https://github.com/iamJpRowan/obsidian-simple-icons/releases)
2. Extract files to `{VaultFolder}/.obsidian/plugins/simple-icons/`
3. Reload Obsidian (Ctrl/Cmd + R)
4. Enable in **Settings** → **Community Plugins**

## Quick Configuration

### Method 1: Frontmatter (Recommended)

Add an icon to any note:

```yaml
---
icon: home
---
```

That's it! The icon will appear in wikilinks, tabs, and file lists.

### Method 2: Tags

1. Open **Settings** → **Simple Icons**
2. Enable **"Enable tags"**
3. Click **"Add tag mapping"**
4. Enter tag name: `project`
5. Click **"Pick"** and select an icon (e.g., `folder`)
6. Any note with `#project` now shows the folder icon

### Method 3: Folders

1. Open **Settings** → **Simple Icons**
2. Enable **"Enable folders"**
3. Click **"Add folder mapping"**
4. Enter folder path: `daily-notes`
5. Click **"Pick"** and select an icon (e.g., `calendar`)
6. All files in `daily-notes/` now show the calendar icon

## Finding Icons

Use the built-in icon picker:
- Click any **"Pick"** button in settings
- Search by name (e.g., "book", "star", "home")
- Click to select

Browse all icons at: [lucide.dev/icons](https://lucide.dev/icons)

## Common Icon Names

- Files: `file`, `file-text`, `book`, `book-open`, `scroll`
- Folders: `folder`, `folder-open`, `archive`
- Time: `calendar`, `calendar-days`, `clock`, `timer`
- Status: `check`, `check-circle`, `x`, `alert-circle`, `alert-triangle`
- Work: `briefcase`, `code`, `terminal`, `database`, `server`
- Personal: `home`, `heart`, `star`, `bookmark`, `user`

## Where Icons Appear

Icons automatically show in:
- ✅ Wikilinks in reading and live preview mode
- ✅ Tab headers
- ✅ Inline file titles
- ✅ File explorer
- ✅ Search results
- ✅ Autocomplete suggestions

## Priority Order

When multiple methods assign icons:
1. **Frontmatter** (highest priority)
2. **Tags** (order in settings matters)
3. **Folders** (deepest folder wins)

## Example Workflow

Create a project management system:

1. **Tag mapping**: `urgent` → `alert-circle`
2. **Tag mapping**: `project` → `folder`
3. **Folder mapping**: `projects/completed` → `check-circle`

Now:
- Notes tagged `#urgent` show alert icons
- Notes tagged `#project` show folder icons
- Completed projects show check icons
- Individual notes can override with frontmatter

## Next Steps

- **Full usage guide**: See [Icon Reference](icon-reference.md)
- **Troubleshooting**: See [Troubleshooting Guide](troubleshooting.md)
- **Report issues**: [GitHub Issues](https://github.com/iamJpRowan/obsidian-simple-icons/issues)

## Quick Troubleshooting

**Icons not showing?**
- Check that the method is enabled (frontmatter/tags/folders)
- Check that rendering is enabled (wikilinks/file view/file lists)
- Verify icon name at [lucide.dev](https://lucide.dev)
- Try reloading Obsidian (Ctrl/Cmd + R)

**Need help?**
- See full [Troubleshooting Guide](troubleshooting.md)
- Open an issue on [GitHub](https://github.com/iamJpRowan/obsidian-simple-icons/issues)

