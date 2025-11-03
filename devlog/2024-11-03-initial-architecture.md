---
date: 2024-11-03
title: Initial Architecture
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
  human_focus: implementation, architecture decisions, design patterns
  ai_focus: documentation writing, structure organization
tags: [architecture, foundation, design-decisions]
summary: Plugin foundation and core design decisions for Simple Icons
status: complete
---

# 2024-11-03 - Initial Architecture

## Collaboration Summary

**Human Developer:** jprowan  
**Documentation Assistant:** Claude Sonnet 4.5 (Anthropic)  
**Development Environment:** Cursor IDE  
**Implementation Date:** November 3, 2024  
**Documentation Date:** November 3, 2024  
**Collaboration Style:** Retrospective documentation of completed implementation

---

## Context

Starting a new Obsidian plugin to display icons next to files throughout the interface. The plugin needed to:
- Work across multiple UI locations (wikilinks, tabs, file explorer)
- Support multiple icon association methods (frontmatter, tags, folders)
- Be performant even in large vaults
- Use Obsidian's built-in Lucide icons (no external dependencies)

## Implementation

### Core Components

**1. Main Plugin (`main.ts`)**
- Entry point using Obsidian's `Plugin` class
- Handles plugin lifecycle (load/unload)
- Manages settings persistence
- Coordinates between components

**2. Type System (`types.ts`)**
- Centralized TypeScript interfaces
- Settings configuration structure
- Ensures type safety across components

**3. Icon Resolution (`IconResolver.ts`)**
- Single source of truth for icon determination
- Implements priority system: Frontmatter > Tags > Folders
- Caches results for performance
- Abstracts association logic from rendering

**4. Icon Rendering (`IconRenderer.ts`)**
- Coordinates all renderer classes
- Provides common icon creation utilities
- Manages observer lifecycle
- Central point for enabling/disabling renderers

### Design Decisions

**Separation of Resolution and Rendering**

Why: Icon *determination* (which icon?) is different from icon *display* (where and how?)

```
IconResolver → determines icon for a file
IconRenderer → coordinates where icons appear
Specific Renderers → handle individual locations
```

This allows:
- Testing resolution logic independently
- Adding new rendering locations without changing resolution
- Different rendering strategies per location

**Caching Strategy**

Implemented a simple cache in `IconResolver`:
```typescript
private cache = new Map<string, string | null>();
```

Why:
- Same file may need icon in multiple locations
- Resolution involves file reads (frontmatter) and lookups (tags/folders)
- Cache invalidation on file changes only

**Observer-Based Rendering**

Used `MutationObserver` for dynamic content:
```typescript
new MutationObserver((mutations) => {
    // Find new DOM nodes
    // Add icons
});
```

Why:
- Obsidian dynamically updates DOM
- Can't rely on one-time rendering
- Observers watch for changes automatically

## Challenges

### Challenge 1: Obsidian's Dynamic DOM

**Problem**: Obsidian continuously updates the DOM as users navigate, edit, and interact. Icons would disappear or not appear on new elements.

**Solution**: Implemented `MutationObserver` pattern in each renderer to watch for DOM changes and re-render icons as needed.

### Challenge 2: Multiple Rendering Locations

**Problem**: Each location (wikilinks, tabs, explorer) has different DOM structures and update patterns.

**Solution**: Created separate renderer classes for each location, each with its own logic but sharing common utilities from `IconRenderer`.

### Challenge 3: Performance with Large Vaults

**Problem**: Checking thousands of files for icons could be slow.

**Solution**: 
- Lazy evaluation (only resolve when needed)
- Caching (avoid repeated calculations)
- Efficient DOM queries (specific selectors, not broad searches)

### Challenge 4: Live Preview Mode

**Problem**: Obsidian's live preview mode uses CodeMirror 6 with a complex extension system. Can't use simple DOM manipulation.

**Solution**: Created `EditorExtension.ts` using CodeMirror 6's decoration API. Icons are proper editor decorations, not DOM hacks.

## Results

### What Works Well

✅ **Clean Architecture**: Easy to understand and extend  
✅ **Type Safety**: TypeScript catches errors early  
✅ **Performance**: Responsive even with 1000+ files  
✅ **Maintainability**: Each component has single responsibility  

### Project Structure

```
src/
├── main.ts              # Plugin entry point
├── types.ts             # Type definitions
├── IconResolver.ts      # Icon determination logic
├── IconRenderer.ts      # Rendering coordination
├── IconElementFactory.ts # Icon DOM creation
├── ObserverManager.ts   # Observer lifecycle
└── renderers/           # Location-specific renderers
    ├── WikilinkRenderer.ts
    ├── FileViewRenderer.ts
    └── FileListRenderer.ts
```

### Key Learnings

1. **Separation of concerns** is crucial in Obsidian plugins - DOM rendering and business logic should be separate

2. **Obsidian's API is partially documented** - Had to inspect source code and experiment with internal APIs

3. **Performance matters** - Even small inefficiencies multiply in large vaults

4. **Caching is essential** - The same file's icon is needed in many places

## Next Steps

### Immediate Improvements

- [ ] Add more robust error handling
- [ ] Implement comprehensive logging for debugging
- [ ] Add metrics/telemetry for performance monitoring

### Future Features

- [ ] Support for custom icon packs
- [ ] Animated icons for specific states
- [ ] Icon customization (size, color)
- [ ] Conditional icons based on file properties

### Technical Debt

- [ ] Add automated tests (unit and integration)
- [ ] Improve TypeScript strict mode compliance
- [ ] Document internal APIs with JSDoc
- [ ] Create performance benchmarks

## References

- [Obsidian API Documentation](https://github.com/obsidianmd/obsidian-api)
- [Lucide Icons](https://lucide.dev)
- [CodeMirror 6 Documentation](https://codemirror.net/6/)

---

**Related Entries**: [Renderer System](2024-11-03-renderer-system.md), [Icon Resolution](2024-11-03-icon-resolution.md)

