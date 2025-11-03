# Testing Guide

Guide for testing Simple Icons plugin during development and before releases.

## Testing Philosophy

Simple Icons modifies UI rendering in multiple locations across Obsidian. Thorough testing requires:
- Testing each rendering location
- Testing each icon association method
- Testing priority and conflict resolution
- Testing performance with various vault sizes
- Testing edge cases and error handling

## Manual Testing Checklist

### Prerequisites

- [ ] Test vault prepared with sample files
- [ ] Multiple test files with different configurations
- [ ] Test folders with nested structures
- [ ] Files with various tag combinations

### Basic Functionality

#### Frontmatter Icons

- [ ] Icon shows with valid icon name
- [ ] Icon updates when frontmatter changes
- [ ] No icon shows with invalid name
- [ ] Custom property name works (not just `icon`)
- [ ] Works with other frontmatter properties
- [ ] Empty property doesn't cause errors

#### Tag Icons

- [ ] Tag mapping creation works
- [ ] Icons show for files with mapped tags
- [ ] Priority order respected (first tag wins)
- [ ] Reordering tags updates priority
- [ ] Deleting tag mapping removes icons
- [ ] Files with no mapped tags show no icon

#### Folder Icons

- [ ] Folder mapping creation works
- [ ] Icons show for files in mapped folders
- [ ] Nested folders work (deepest wins)
- [ ] Path variations work (with/without slashes)
- [ ] Deleting folder mapping removes icons
- [ ] Files outside mapped folders show no icon

### Rendering Locations

#### Wikilinks

- [ ] Icons show in reading mode
- [ ] Icons show in live preview mode
- [ ] Icons show in source mode (CodeMirror extension)
- [ ] Multiple wikilinks on same line
- [ ] Wikilinks with aliases: `[[file|alias]]`
- [ ] Nested wikilinks in lists
- [ ] Wikilinks in tables
- [ ] Wikilinks in blockquotes

#### File View

- [ ] Icons show in tab headers
- [ ] Icons show in inline titles
- [ ] Icons update when switching tabs
- [ ] Icons update when file changes
- [ ] Multiple tabs open simultaneously
- [ ] Split panes show correct icons

#### File Lists

- [ ] Icons show in file explorer
- [ ] Icons show in search results
- [ ] Icons show in quick switcher
- [ ] Icons show in backlinks panel
- [ ] Icons update when explorer refreshes
- [ ] Folders show correct icons
- [ ] Collapsing/expanding folders

### Priority System

#### Frontmatter vs Tags

- [ ] Frontmatter overrides tags
- [ ] Removing frontmatter shows tag icon
- [ ] Invalid frontmatter falls back to tags

#### Frontmatter vs Folders

- [ ] Frontmatter overrides folders
- [ ] Removing frontmatter shows folder icon
- [ ] Invalid frontmatter falls back to folders

#### Tags vs Folders

- [ ] Tags override folders
- [ ] Tag priority order respected
- [ ] Multiple tags use first match
- [ ] Removing tag shows folder icon

#### All Three Methods

- [ ] Frontmatter > Tags > Folders
- [ ] Correct fallback chain
- [ ] Updates propagate correctly

### Settings & Configuration

#### Toggles

- [ ] Disabling frontmatter removes frontmatter icons
- [ ] Disabling tags removes tag icons
- [ ] Disabling folders removes folder icons
- [ ] Disabling wikilinks removes wikilink icons
- [ ] Disabling file view removes tab/title icons
- [ ] Disabling file lists removes explorer icons

#### Icon Picker

- [ ] Icon picker opens
- [ ] Search filters icons
- [ ] Selecting icon updates mapping
- [ ] Icon preview shows correctly
- [ ] Picker works for tags
- [ ] Picker works for folders

#### Settings Persistence

- [ ] Settings save on change
- [ ] Settings persist after reload
- [ ] Settings persist after restart
- [ ] Mappings maintain order
- [ ] No data loss on update

### Edge Cases

#### File Names

- [ ] Files with special characters
- [ ] Files with spaces
- [ ] Files with Unicode characters
- [ ] Very long file names
- [ ] Files without extensions

#### Icon Names

- [ ] Valid Lucide icon names
- [ ] Invalid icon names (graceful failure)
- [ ] Empty icon property
- [ ] Icon names with typos
- [ ] Case sensitivity (should be lowercase)

#### File Locations

- [ ] Root-level files
- [ ] Deeply nested files (5+ levels)
- [ ] Files in system folders (.obsidian, etc.)
- [ ] Files moved between folders
- [ ] Files renamed

#### Tags

- [ ] Nested tags: `project/work`
- [ ] Multiple tags in frontmatter
- [ ] Multiple tags inline: `#tag1 #tag2`
- [ ] Tags with special characters
- [ ] Tags in content vs frontmatter

#### Content Types

- [ ] Regular markdown files
- [ ] Canvas files
- [ ] Excalidraw files
- [ ] PDF files
- [ ] Image files

### Performance Testing

#### Small Vault (<100 files)

- [ ] Icons render instantly
- [ ] No perceptible lag
- [ ] Smooth scrolling in explorer
- [ ] Quick file switching

#### Medium Vault (100-1000 files)

- [ ] Icons render quickly
- [ ] Minimal lag on operations
- [ ] Explorer scrolling smooth
- [ ] Search remains responsive

#### Large Vault (>1000 files)

- [ ] Icons still functional
- [ ] Acceptable render time (<1s)
- [ ] No UI freezing
- [ ] Memory usage reasonable

**Performance metrics to watch**:
- Icon render time
- DOM operation count
- Memory usage (DevTools)
- CPU usage during operations

### Error Handling

- [ ] Invalid icon names fail gracefully
- [ ] Corrupted settings don't break plugin
- [ ] Missing files don't cause errors
- [ ] Race conditions handled
- [ ] Console shows no errors during normal use

### Cross-Platform Testing

#### Desktop

- [ ] Windows
- [ ] macOS
- [ ] Linux

#### Mobile

- [ ] iOS
- [ ] Android
- [ ] Responsive icon sizes
- [ ] Touch interactions work

### Plugin Compatibility

Test with commonly used plugins:
- [ ] Dataview
- [ ] Templater
- [ ] Calendar
- [ ] Kanban
- [ ] Excalidraw
- [ ] Custom CSS themes

## Automated Testing (Future)

Currently, testing is manual. Future improvements could include:

### Unit Tests

```typescript
describe('IconResolver', () => {
    it('should resolve frontmatter icon', () => {
        // Test icon resolution logic
    });

    it('should respect priority order', () => {
        // Test priority system
    });
});
```

### Integration Tests

```typescript
describe('Icon Rendering', () => {
    it('should render icons in file explorer', () => {
        // Test DOM rendering
    });
});
```

### E2E Tests

Using Obsidian plugin testing framework (when available).

## Testing Workflow

### Before Committing

1. [ ] Test changed functionality
2. [ ] Verify no console errors
3. [ ] Test basic use cases
4. [ ] Check settings still work

### Before Pull Request

1. [ ] Full manual testing checklist
2. [ ] Test on different Obsidian version
3. [ ] Test with clean vault
4. [ ] Test with production vault
5. [ ] Update documentation if needed

### Before Release

1. [ ] Complete testing checklist
2. [ ] Test on all platforms (if possible)
3. [ ] Test with popular plugins
4. [ ] Performance testing
5. [ ] Update CHANGELOG.md
6. [ ] Version numbers updated
7. [ ] Tag and release notes prepared

## Reporting Test Results

When reporting issues or test results, include:

```markdown
## Test Environment
- Obsidian version: 
- Plugin version: 
- OS: 
- Vault size: 
- Other plugins: 

## Test Case
[Description of what was tested]

## Expected Result
[What should happen]

## Actual Result
[What actually happened]

## Steps to Reproduce
1. 
2. 
3. 

## Console Errors
```
[paste any errors]
```

## Screenshots
[attach if relevant]
```

## Test Vaults

### Minimal Test Vault

Create a minimal vault for isolated testing:

```
test-vault/
├── .obsidian/plugins/simple-icons/
├── basic-note.md
├── frontmatter-test.md (icon: star)
├── tag-test.md (#project)
├── projects/
│   └── work-note.md
└── daily-notes/
    └── 2024-01-01.md
```

### Comprehensive Test Vault

Create a comprehensive vault covering all scenarios:

```
test-vault/
├── root-file.md
├── frontmatter/
│   ├── valid-icon.md (icon: star)
│   ├── invalid-icon.md (icon: notexist)
│   └── empty-icon.md (icon: )
├── tags/
│   ├── single-tag.md (#project)
│   ├── multiple-tags.md (#project #urgent)
│   └── no-tags.md
├── folders/
│   ├── level1.md
│   └── deep/
│       └── level2/
│           └── level3.md
├── special-chars/
│   ├── file with spaces.md
│   ├── file-with-émoji.md
│   └── file@special#chars.md
└── edge-cases/
    ├── very-long-filename-that-goes-on-and-on.md
    ├── .hidden-file.md
    └── [[wikilinks-in-name]].md
```

## Testing Tools

### Obsidian DevTools

Access with **Ctrl/Cmd + Shift + I**

**Useful panels**:
- **Console**: Check for errors
- **Elements**: Inspect icon DOM elements
- **Performance**: Profile rendering
- **Memory**: Check for leaks
- **Network**: Monitor resource loading

### Useful Console Commands

```javascript
// Check plugin status
app.plugins.plugins['simple-icons']

// Get current file
app.workspace.getActiveFile()

// Force refresh
app.workspace.trigger('layout-change')
```

## Known Issues to Test

Document any known issues and verify they're still reproducible:

1. **Issue**: Icons may not update immediately after settings change
   - **Workaround**: Reload Obsidian
   - **Test**: Verify workaround still works

2. **Issue**: Performance with >5000 files untested
   - **Status**: Needs testing with large vaults
   - **Test**: Find users with large vaults

---

## Quick Test

Minimal smoke test for quick verification:

1. [ ] Create file with frontmatter icon
2. [ ] Open file in editor (check tab icon)
3. [ ] Create wikilink to file (check icon appears)
4. [ ] Check file explorer (check icon appears)
5. [ ] No console errors

If all pass, basic functionality is working.

---

For questions about testing, see [Contributing Guide](contributing.md) or open a discussion on GitHub.

