# Icon Reference Guide

Complete guide to using icons in Simple Icons plugin.

## Table of Contents

- [Icon Association Methods](#icon-association-methods)
- [Rendering Locations](#rendering-locations)
- [Priority System](#priority-system)
- [Finding Icons](#finding-icons)
- [Common Icon Categories](#common-icon-categories)
- [Advanced Usage](#advanced-usage)

## Icon Association Methods

Simple Icons supports three methods for associating icons with files. You can use all three simultaneously, with conflicts resolved by priority order.

### Method 1: Frontmatter

**Best for**: Individual file customization

Add an icon property to your file's frontmatter:

```yaml
---
icon: home
---
```

**Configuration**:
- **Setting**: "Enable frontmatter"
- **Property name**: Customizable (default: `icon`)

**Examples**:

```yaml
---
icon: book-open
tags: [reading]
---
# My Reading Notes
```

```yaml
---
icon: code
tags: [programming, tutorial]
---
# Python Tutorial
```

**Custom property name**:
1. Settings → Simple Icons → "Frontmatter property name"
2. Change to your preference (e.g., `file-icon`)
3. Use in frontmatter:
```yaml
---
file-icon: star
---
```

### Method 2: Tags

**Best for**: Categorizing files by topic

Associate icons with tags in plugin settings. Files inherit icons from their tags.

**Configuration**:
1. Settings → Simple Icons → Enable "Enable tags"
2. Click "Add tag mapping"
3. Enter tag name (without #)
4. Click "Pick" to choose icon
5. Repeat for more tags
6. Drag to reorder priority

**Priority**: Order matters! First matching tag (from top) is used.

**Examples**:

Setup:
```
1. urgent → alert-circle
2. project → folder
3. personal → user
```

File with tags:
```yaml
---
tags: [urgent, project]
---
```
**Result**: Shows `alert-circle` (urgent is higher priority)

**Best practices**:
- Put most important tags at top
- Use specific tags for specific icons
- Use hierarchical tags: `project/work`, `project/personal`

### Method 3: Folders

**Best for**: Organizing entire directories

Associate icons with folder paths. All files in that folder (and subfolders) inherit the icon.

**Configuration**:
1. Settings → Simple Icons → Enable "Enable folders"
2. Click "Add folder mapping"
3. Enter folder path (relative to vault root)
4. Click "Pick" to choose icon
5. Repeat for more folders

**Priority**: Deepest (most specific) folder wins.

**Examples**:

Setup:
```
daily-notes → calendar
daily-notes/2024 → calendar-days
projects → folder
projects/work → briefcase
projects/personal → user
```

File: `projects/work/client-notes.md`
**Result**: Shows `briefcase` (most specific)

File: `daily-notes/2023/jan.md`
**Result**: Shows `calendar` (2023 has no specific mapping)

**Path tips**:
- Use forward slashes: `projects/work`
- No leading slash: `projects` not `/projects`
- No trailing slash: `projects` not `projects/`
- Relative to vault root

## Rendering Locations

Control where icons appear in Obsidian:

### Wikilinks

Icons appear next to wikilinks in your notes.

**Locations**:
- **Reading mode**: `[[file]]` renders with icon
- **Live preview**: `[[icon file]]` shows icon inside brackets
- **Source mode**: No rendering (plain text)

**Setting**: "Render in wikilinks"

**Example**:

Source: `See [[project-notes]] for details`

Reading/Live preview: `See [📁 project-notes] for details`

### File View

Icons appear in the editor interface.

**Locations**:
- **Tab headers**: Icon next to filename in tabs
- **Inline title**: Icon at top of editor

**Setting**: "Render in file view"

**Example**:

Tab: `[📁 project-notes]`

Inline title: 
```
📁 Project Notes
Your content here...
```

### File Lists

Icons appear in file browsers and search.

**Locations**:
- **File explorer**: Icon next to each file
- **Search results**: Icon next to matching files
- **Quick switcher**: Icon in file list (if supported)
- **Other file lists**: Any Obsidian view listing files

**Setting**: "Render in file lists"

**Example**:

File Explorer:
```
📁 project-notes
📅 daily-note
🏠 home
```

## Priority System

When multiple methods assign icons to the same file, the priority order is:

### Priority Order (Highest to Lowest)

1. **Frontmatter** - Direct file specification
2. **Tags** - First matching tag (by settings order)
3. **Folders** - Deepest matching folder

### Example Scenarios

**Scenario 1**: All three methods

```yaml
---
icon: star
tags: [project, urgent]
---
```
- File location: `work/active/file.md`
- Tag mappings: `project → folder`, `urgent → alert-circle`
- Folder mapping: `work → briefcase`

**Result**: `star` (frontmatter wins)

**Scenario 2**: Tags and folders

```yaml
---
tags: [project, urgent]
---
```
- File location: `work/active/file.md`
- Tag mappings: `urgent → alert-circle`, `project → folder`
- Folder mapping: `work → briefcase`

**Result**: `alert-circle` (urgent is first in tag list)

**Scenario 3**: Multiple folders

```yaml
---
tags: []
---
```
- File location: `work/active/projects/file.md`
- Folder mappings: `work → briefcase`, `work/active/projects → folder`

**Result**: `folder` (most specific folder)

## Finding Icons

### Icon Picker

Built-in visual icon selector:

1. Open any "Pick" button in settings
2. Search by name (e.g., "book", "star")
3. Scroll through available icons
4. Click to select

**Search tips**:
- Start typing to filter
- Try synonyms: "document" → "file"
- Check categories: "calendar", "alert", "code"

### Icon Names

All icons use Lucide icon names with hyphens:

**Format**: `lowercase-with-hyphens`

**Examples**:
- ✅ `book-open`
- ✅ `alert-circle`
- ✅ `calendar-days`
- ❌ `bookOpen` (wrong format)
- ❌ `book open` (spaces not allowed)
- ❌ `book_open` (underscores not used)

### Browse All Icons

Visit [lucide.dev/icons](https://lucide.dev/icons) to:
- Browse complete icon library
- See icon previews
- Copy icon names

## Common Icon Categories

### Files & Documents

```
file, file-text, file-code, file-image
book, book-open, book-marked
scroll, newspaper
document, documents
sticky-note, note
```

### Folders & Organization

```
folder, folder-open, folder-closed
archive, archive-box
inbox, box
package
```

### Time & Dates

```
calendar, calendar-days, calendar-range
clock, timer, stopwatch
alarm-clock
hourglass
```

### Status & Alerts

```
check, check-circle, check-square
x, x-circle, x-square
alert-circle, alert-triangle
info, help-circle
```

### Work & Productivity

```
briefcase, business
code, code-2, terminal
database, server, cloud
tool, wrench, hammer
settings, cog
```

### Personal & Social

```
home, house
user, users, user-circle
heart, star, bookmark
smile, laugh
mail, message, chat
```

### Navigation

```
arrow-left, arrow-right, arrow-up, arrow-down
chevron-left, chevron-right, chevron-up, chevron-down
menu, more-horizontal, more-vertical
external-link, link
```

### Media

```
image, camera, video, film
music, headphones, mic
play, pause, stop
volume, volume-2
```

### Nature & Objects

```
sun, moon, cloud, umbrella
tree, leaf, flower
coffee, pizza, gift
lightbulb, key, lock
```

## Advanced Usage

### Dynamic Icon Systems

Create icon systems that adapt to your workflow:

**Example**: Task management
```
Tag mappings (priority order):
1. todo → circle
2. in-progress → loader
3. done → check-circle
4. blocked → alert-octagon
```

**Example**: Project phases
```
Folder mappings:
ideas/ → lightbulb
planning/ → list
active/ → zap
review/ → eye
completed/ → check-circle
archived/ → archive
```

### Hierarchical Organization

Combine methods for complex systems:

```
Folders: Base organization
projects/ → folder
projects/work/ → briefcase
projects/personal/ → user

Tags: Cross-cutting concerns
urgent → alert-circle
important → star
archived → archive-x

Frontmatter: Special cases
(individual files can override)
```

### Visual Consistency

Choose related icons for related content:

**Calendar/Time**:
```
daily/ → calendar
weekly/ → calendar-range
monthly/ → calendar-days
yearly/ → calendar-heart
```

**Status progression**:
```
new → circle
started → play-circle
progress → loader
review → eye
done → check-circle
```

### Performance Tips

**For large vaults**:
1. Use folder mappings for bulk organization
2. Use tag mappings sparingly (most impactful tags)
3. Use frontmatter only for exceptions
4. Disable unused rendering locations

**For maximum speed**:
- Frontmatter is fastest (direct lookup)
- Folders are next (simple path matching)
- Tags are slowest (requires tag parsing)

### Accessibility

Icons are decorative and don't replace text:
- Filenames remain visible
- Icons are additive, not replacements
- Screen readers still read full filenames

---

## Quick Reference

**Association**:
- Frontmatter: `icon: name`
- Tags: Settings → Add mapping
- Folders: Settings → Add mapping

**Priority**: Frontmatter > Tags > Folders

**Icon names**: `lowercase-with-hyphens`

**Browse**: [lucide.dev/icons](https://lucide.dev/icons)

**Help**: [Troubleshooting Guide](troubleshooting.md)

