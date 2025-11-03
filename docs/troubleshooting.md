# Troubleshooting Guide

Common issues and solutions for Simple Icons plugin.

## Icons Not Appearing

### Check Rendering Settings

**Symptom**: Icons aren't showing anywhere

**Solution**:
1. Open **Settings** → **Simple Icons**
2. Verify rendering locations are enabled:
   - ✅ Render in wikilinks
   - ✅ Render in file view
   - ✅ Render in file lists

### Check Association Method

**Symptom**: Icons not showing for specific files

**Solution**:
1. Verify the association method is enabled:
   - For frontmatter: **Enable frontmatter** must be ON
   - For tags: **Enable tags** must be ON
   - For folders: **Enable folders** must be ON

2. Check the configuration:
   - **Frontmatter**: Property name matches (default: `icon`)
   - **Tags**: Tag mapping exists for the file's tags
   - **Folders**: Folder mapping exists for the file's location

### Invalid Icon Name

**Symptom**: Icon not showing for a specific file

**Solution**:
1. Verify the icon name is valid at [lucide.dev/icons](https://lucide.dev/icons)
2. Common mistakes:
   - Using spaces: `check circle` → `check-circle`
   - Wrong names: `folder-icon` → `folder`
   - Typos: `calender` → `calendar`

3. Use the icon picker instead:
   - Open settings
   - Click **"Pick"** button
   - Search and select visually

### Force Refresh

**Symptom**: Icons not updating after changes

**Solution**:
1. **Reload Obsidian**: Ctrl/Cmd + R
2. **Toggle plugin**: Off then on
3. **Edit file**: Add/remove a space to trigger update
4. **Restart Obsidian**: Complete restart

## Wrong Icon Showing

### Check Priority Order

Icons follow this priority:
1. **Frontmatter** (highest)
2. **Tags** (first matching tag in your priority list)
3. **Folders** (deepest matching folder)

**Example issue**:
```yaml
---
icon: home
tags: [project]
---
```

File is in `work/` folder with these mappings:
- Tag `project` → `folder`
- Folder `work` → `briefcase`

**Result**: Shows `home` icon (frontmatter wins)

**Solution**: Remove frontmatter icon to use tag or folder icon

### Tag Priority Order

**Symptom**: Wrong tag icon showing when file has multiple tags

**Example**:
```yaml
tags: [urgent, project, work]
```

Tag mappings:
1. `work` → `briefcase` (top of list)
2. `urgent` → `alert-circle`
3. `project` → `folder`

**Result**: Shows `briefcase` (first match in priority order)

**Solution**:
- Reorder tag mappings: Drag `urgent` to top
- Or use frontmatter to override: `icon: alert-circle`

### Folder Depth Priority

**Symptom**: Wrong folder icon showing

**Example**:
- Folder mappings:
  - `projects` → `folder`
  - `projects/work` → `briefcase`
- File location: `projects/work/notes/file.md`

**Result**: Shows `briefcase` (deepest match: `projects/work`)

**Solution**: Intended behavior - most specific folder wins

## Performance Issues

### Slow Icon Updates

**Symptom**: Icons take time to appear or update

**Possible causes**:
1. **Large vault**: 1000+ files
2. **Too many observers**: Multiple renderers active
3. **Complex tag rules**: Many tag mappings

**Solutions**:
1. Disable unused rendering locations:
   - If you don't use wikilinks, disable wikilink rendering
   - If you don't use file explorer, disable file list rendering

2. Reduce mappings:
   - Remove unused tag mappings
   - Remove unused folder mappings
   - Consolidate rules where possible

3. Use frontmatter for frequently updated files:
   - Direct frontmatter is fastest
   - Reduces tag/folder lookups

### UI Lag

**Symptom**: Obsidian feels sluggish with plugin enabled

**Solution**:
1. Check vault size:
   - Plugin is optimized for <5000 files
   - Report performance with larger vaults

2. Monitor other plugins:
   - Disable other plugins to isolate issue
   - Some combinations may conflict

3. Report issue:
   - Open [GitHub Issue](https://github.com/iamJpRowan/obsidian-simple-icons/issues)
   - Include vault size and other plugins

## Settings Issues

### Tag Mapping Not Saving

**Symptom**: Tag mappings disappear after reload

**Solution**:
1. Ensure you clicked the checkmark (✓) after adding
2. Check no browser/Obsidian errors in console
3. Try:
   - Disable and re-enable plugin
   - Restart Obsidian
   - Manually check `.obsidian/plugins/simple-icons/data.json`

### Icon Picker Not Opening

**Symptom**: Click "Pick" but nothing happens

**Solution**:
1. Check console for errors (Ctrl/Cmd + Shift + I)
2. Try:
   - Reload Obsidian
   - Update plugin to latest version
   - Report issue with console errors

### Settings Reset After Update

**Symptom**: Settings lost after plugin update

**Solution**:
1. **Backup settings** before updating:
   - Copy `.obsidian/plugins/simple-icons/data.json`
   - Export settings (if feature available)

2. **Restore**:
   - Paste backup file
   - Reload Obsidian

## Platform-Specific Issues

### Mobile (iOS/Android)

**Known differences**:
- Icon picker may have different layout
- Some rendering locations may behave differently
- Performance may vary

**Solution**:
- Test on desktop first
- Report mobile-specific issues separately

### Linux

**Icon rendering issues**:
- May depend on font rendering
- Check system font configuration

### Windows

**Path issues**:
- Use forward slashes in folder paths: `projects/work` not `projects\work`

## Conflicts with Other Plugins

### Icon Conflicts

**Symptom**: Multiple plugins trying to add icons

**Possible conflicts**:
- Custom File Explorer plugins
- Other icon plugins
- Tab customization plugins

**Solution**:
1. Disable conflicting plugins temporarily
2. Check which plugin's icons you prefer
3. Disable icon rendering in unused plugin
4. Report compatibility issues

### CSS Conflicts

**Symptom**: Icons appear with wrong styling

**Solution**:
1. Check custom CSS snippets
2. Look for conflicting selectors:
   - `.si-icon`
   - `.tree-item-icon`
   - `.workspace-leaf-header`

3. Use browser DevTools to inspect

## Still Having Issues?

### Before Reporting

1. **Check documentation**:
   - [Quick Start Guide](quickstart.md)
   - [Icon Reference](icon-reference.md)
   - [Contributing Guide](contributing.md)

2. **Try clean test**:
   - Create new test vault
   - Install only Simple Icons
   - Test if issue persists

3. **Gather information**:
   - Obsidian version
   - Plugin version
   - Operating system
   - Other plugins installed
   - Console errors (Ctrl/Cmd + Shift + I)

### Report Issue

Open a [GitHub Issue](https://github.com/iamJpRowan/obsidian-simple-icons/issues) with:

**Title**: Brief description (e.g., "Icons not showing in file explorer")

**Description**:
```
**Problem**: Clear description of issue

**Expected behavior**: What should happen

**Actual behavior**: What actually happens

**Steps to reproduce**:
1. Step one
2. Step two
3. Step three

**Environment**:
- Obsidian version: 
- Plugin version: 
- OS: 
- Other plugins: 

**Console errors** (if any):
```
[paste errors here]
```

**Screenshots** (if helpful):
[attach images]
```

### Get Help

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and community support
- **Documentation**: Check [docs/](.) for guides

---

Still stuck? We're here to help! Open an issue and we'll assist you.

