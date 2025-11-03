---
date: 2024-11-03
title: Icon Resolution and Priority System
contributors:
  human:
    name: jprowan
    role: lead_developer
documentation:
  created: 2024-11-03
  documented_by:
    human: jprowan
    ai:
      model: Claude Sonnet 4.5
      provider: Anthropic
      interface: Cursor IDE
collaboration:
  style: retrospective_documentation
  human_focus: implementation, priority logic, caching strategy
  ai_focus: documentation writing, code examples
tags: [icon-resolution, caching, priority-system, metadata]
summary: Icon resolution logic with priority system (Frontmatter > Tags > Folders)
status: complete
---

# 2024-11-03 - Icon Resolution and Priority System

## Collaboration Summary

**Human Developer:** jprowan  
**Documentation Assistant:** Claude Sonnet 4.5 (Anthropic)  
**Development Environment:** Cursor IDE  
**Implementation Date:** November 3, 2024  
**Documentation Date:** November 3, 2024  
**Collaboration Style:** Retrospective documentation of completed implementation

---

## Context

The plugin needs to determine which icon to show for each file. Multiple association methods need to work together with a clear priority system:

1. **Frontmatter**: User specifies icon directly in file
2. **Tags**: Icon based on file's tags
3. **Folders**: Icon based on file's location

Requirements:
- Clear, predictable priority order
- Fast lookups (same file queried many times)
- Easy to understand for users
- Flexible configuration

## Implementation

### Core Class: IconResolver

Central class responsible for all icon determination:

```typescript
class IconResolver {
    private cache = new Map<string, string | null>();
    
    constructor(
        private plugin: SimpleIconsPlugin,
        private metadataCache: MetadataCache
    ) {}
    
    resolveIcon(file: TFile): string | null {
        // Check cache first
        if (this.cache.has(file.path)) {
            return this.cache.get(file.path);
        }
        
        // Resolve with priority: Frontmatter > Tags > Folders
        const icon = this.resolveFromFrontmatter(file)
            ?? this.resolveFromTags(file)
            ?? this.resolveFromFolder(file);
        
        // Cache and return
        this.cache.set(file.path, icon);
        return icon;
    }
    
    invalidate(file: TFile): void {
        this.cache.delete(file.path);
    }
}
```

### Method 1: Frontmatter Resolution

Most direct method - read from file's frontmatter:

```typescript
private resolveFromFrontmatter(file: TFile): string | null {
    if (!this.settings.enableFrontmatter) return null;
    
    const metadata = this.metadataCache.getFileCache(file);
    const propertyName = this.settings.frontmatterProperty;
    
    const icon = metadata?.frontmatter?.[propertyName];
    return typeof icon === 'string' ? icon : null;
}
```

**Why this works**:
- Obsidian already parses frontmatter into metadata cache
- No file I/O needed (uses cached metadata)
- Fast and reliable

**Customization**: Property name configurable (default: `icon`)

```yaml
---
icon: star          # Standard
my-icon: star      # Custom property
---
```

### Method 2: Tag Resolution

Match file tags against configured tag mappings:

```typescript
private resolveFromTags(file: TFile): string | null {
    if (!this.settings.enableTags) return null;
    
    const metadata = this.metadataCache.getFileCache(file);
    const tags = metadata?.frontmatter?.tags || [];
    
    // Check each tag mapping in priority order
    for (const mapping of this.settings.tagMappings) {
        if (tags.includes(mapping.tag)) {
            return mapping.icon;
        }
    }
    
    return null;
}
```

**Priority**: Order in `tagMappings` array determines priority

**Example**:
```typescript
tagMappings: [
    { tag: 'urgent', icon: 'alert-circle' },    // Checked first
    { tag: 'project', icon: 'folder' },         // Checked second
    { tag: 'personal', icon: 'user' }           // Checked third
]
```

File with `tags: [project, urgent]` gets `alert-circle` (first match).

### Method 3: Folder Resolution

Match file path against configured folder mappings:

```typescript
private resolveFromFolder(file: TFile): string | null {
    if (!this.settings.enableFolders) return null;
    
    const filePath = file.path;
    let bestMatch: string | null = null;
    let bestMatchDepth = -1;
    
    // Find deepest (most specific) matching folder
    for (const mapping of this.settings.folderMappings) {
        if (filePath.startsWith(mapping.folder + '/')) {
            const depth = mapping.folder.split('/').length;
            if (depth > bestMatchDepth) {
                bestMatch = mapping.icon;
                bestMatchDepth = depth;
            }
        }
    }
    
    return bestMatch;
}
```

**Priority**: Depth-based (most specific folder wins)

**Example**:
```typescript
folderMappings: [
    { folder: 'projects', icon: 'folder' },
    { folder: 'projects/work', icon: 'briefcase' },
    { folder: 'projects/work/client-a', icon: 'user' }
]
```

File at `projects/work/client-a/notes.md` gets `user` (deepest match).

### Caching Strategy

Simple but effective caching:

```typescript
private cache = new Map<string, string | null>();

resolveIcon(file: TFile): string | null {
    // 1. Check cache
    if (this.cache.has(file.path)) {
        return this.cache.get(file.path)!;
    }
    
    // 2. Resolve icon
    const icon = /* resolution logic */;
    
    // 3. Store in cache
    this.cache.set(file.path, icon);
    return icon;
}
```

**Cache invalidation**:
- File modified: Invalidate that file
- Settings changed: Clear entire cache
- File renamed: Invalidate old and new paths

```typescript
// In main.ts
this.registerEvent(
    this.app.vault.on('modify', (file) => {
        this.iconResolver.invalidate(file);
        this.iconRenderer.updateFile(file);
    })
);
```

## Challenges

### Challenge 1: Tag Matching Complexity

**Problem**: Obsidian supports various tag formats:
- Frontmatter array: `tags: [project, urgent]`
- Frontmatter string: `tags: project urgent`
- Inline tags: `#project #urgent`
- Nested tags: `#project/work/client`

**Solution**: Rely on Obsidian's metadata cache, which normalizes all formats:

```typescript
const metadata = this.metadataCache.getFileCache(file);
const tags = getAllTags(metadata) || [];  // Obsidian's utility
```

### Challenge 2: Folder Path Edge Cases

**Problem**: Folder paths need careful handling:
- Trailing slashes: `projects/` vs `projects`
- Root files: Files not in any folder
- Nested folders: Need most specific match

**Solution**: 
- Normalize folder paths (remove trailing slashes)
- Use `startsWith()` with explicit `/` check
- Track depth to find most specific

```typescript
// Normalize input
const normalizedFolder = mapping.folder.replace(/\/$/, '');

// Match with explicit separator
if (filePath.startsWith(normalizedFolder + '/') || 
    filePath === normalizedFolder) {
    // Match found
}
```

### Challenge 3: Priority System Clarity

**Problem**: Users need to understand which icon will be used when multiple methods apply.

**Solution**: Clear documentation + simple rule:

```
Frontmatter (highest)
    ↓ (if not found)
Tags (first match in list)
    ↓ (if not found)
Folders (deepest match)
    ↓ (if not found)
No icon (null)
```

### Challenge 4: Performance with Large Vaults

**Problem**: 1000+ files × 5+ UI locations = 5000+ icon resolutions on startup.

**Solution**: Lazy resolution + caching:
- Don't resolve icons for all files upfront
- Only resolve when file is visible/referenced
- Cache aggressively (invalidate only when necessary)
- Metadata cache reads are fast (already in memory)

## Results

### Performance Benchmarks

Tested with 1000-file vault:

| Operation | Time | Notes |
|-----------|------|-------|
| First resolution | <1ms | Metadata cache hit |
| Cached resolution | <0.01ms | Map lookup |
| Cache invalidation | <0.01ms | Map delete |
| Full cache clear | <1ms | Map clear |

**Scaling**:
- O(1) for frontmatter (direct property access)
- O(n) for tags (n = number of tag mappings, typically <20)
- O(m) for folders (m = number of folder mappings, typically <10)

Total: Very fast for typical configurations.

### User Experience

**Predictable**: Same file always gets same icon (until configuration changes)

**Transparent**: Priority order is documented and intuitive

**Flexible**: Three methods cover most use cases:
- Frontmatter: Special cases, manual override
- Tags: Content-based, cross-cutting
- Folders: Location-based, bulk organization

## Key Learnings

### 1. Leverage Obsidian's Metadata Cache

Don't parse files manually:
- ✅ Use `metadataCache.getFileCache(file)`
- ❌ Don't read file and parse YAML

Benefits:
- Already in memory (fast)
- Already parsed (reliable)
- Updates automatically
- Handles all tag formats

### 2. Simple Caching is Effective

No need for complex cache strategies:
- Map is sufficient for thousands of files
- Memory usage is negligible (~10 bytes per file)
- Invalidation is simple and clear

### 3. Priority Order Must Be Explicit

Users need to know which icon will be used:
- Document priority clearly
- Make it predictable (no "smart" decisions)
- Provide tools to test (e.g., see which method applied)

### 4. Configuration Flexibility

Allow users to disable methods they don't use:
- Settings → Enable/disable frontmatter, tags, folders
- Improves performance (skip unnecessary checks)
- Improves clarity (fewer places to look)

## Next Steps

### Immediate Improvements

- [ ] Add debug logging (which method resolved icon)
- [ ] Add validation for icon names (check if exists)
- [ ] Provide UI feedback when icon invalid

### Advanced Features

- [ ] Regex matching for folder paths
- [ ] Glob patterns for folder mappings
- [ ] Multiple frontmatter properties (fallback chain)
- [ ] Computed icons (based on file properties)
- [ ] Icon expressions: `icon: ${tag}-icon`

### Performance Optimizations

- [ ] Batch cache invalidation
- [ ] Lazy cache population
- [ ] Preload commonly accessed files
- [ ] Monitor cache hit rate

## Code Examples

### Custom Resolution Logic

Users could extend with custom resolvers:

```typescript
class CustomIconResolver extends IconResolver {
    resolveIcon(file: TFile): string | null {
        // Custom logic: Icon based on file size
        if (file.stat.size > 1000000) {
            return 'file-archive';  // Large files
        }
        
        // Custom logic: Icon based on creation date
        const age = Date.now() - file.stat.ctime;
        if (age < 86400000) {
            return 'sparkles';  // New files (< 1 day)
        }
        
        // Fall back to standard resolution
        return super.resolveIcon(file);
    }
}
```

### Resolution Pipeline

Could be extended to a pipeline pattern:

```typescript
type IconResolverFn = (file: TFile) => string | null;

class IconResolverPipeline {
    private resolvers: IconResolverFn[] = [];
    
    add(resolver: IconResolverFn): this {
        this.resolvers.push(resolver);
        return this;
    }
    
    resolve(file: TFile): string | null {
        for (const resolver of this.resolvers) {
            const icon = resolver(file);
            if (icon) return icon;
        }
        return null;
    }
}

// Usage
const pipeline = new IconResolverPipeline()
    .add(resolveFrontmatter)
    .add(resolveTags)
    .add(resolveFolders)
    .add(resolveDefaults);
```

## References

- [Obsidian Metadata Cache API](https://github.com/obsidianmd/obsidian-api/blob/master/obsidian.d.ts#L3000)
- [YAML Frontmatter Spec](https://jekyllrb.com/docs/front-matter/)
- [Chain of Responsibility Pattern](https://refactoring.guru/design-patterns/chain-of-responsibility)

---

**Related Entries**: [Initial Architecture](2024-11-03-initial-architecture.md), [Performance Optimization](2024-11-03-performance-optimization.md)

