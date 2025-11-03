---
date: 2024-11-03
title: Performance Optimization
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
  human_focus: implementation, performance tuning, benchmarking
  ai_focus: documentation writing, optimization explanations
tags: [performance, caching, optimization, memory-management]
summary: Performance optimization through caching, observer management, and efficient DOM queries
status: complete
---

# 2024-11-03 - Performance Optimization

## Collaboration Summary

**Human Developer:** jprowan  
**Documentation Assistant:** Claude Sonnet 4.5 (Anthropic)  
**Development Environment:** Cursor IDE  
**Implementation Date:** November 3, 2024  
**Documentation Date:** November 3, 2024  
**Collaboration Style:** Retrospective documentation of completed implementation

---

## Context

Initial implementation worked but needed optimization for:
- **Large vaults**: 1000+ files with icons in multiple locations
- **Frequent updates**: Files changing, settings changing, UI updating
- **Observer overhead**: Multiple MutationObservers watching DOM
- **Memory efficiency**: Long-running plugin session

Goal: Keep plugin responsive and lightweight even in heavy usage.

## Implementation

### 1. Caching System

**Icon Resolution Cache**

Simple Map-based cache in `IconResolver`:

```typescript
class IconResolver {
    private cache = new Map<string, string | null>();
    
    resolveIcon(file: TFile): string | null {
        // Check cache first
        const cached = this.cache.get(file.path);
        if (cached !== undefined) return cached;
        
        // Resolve and cache
        const icon = this.doResolve(file);
        this.cache.set(file.path, icon);
        return icon;
    }
    
    invalidate(file: TFile): void {
        this.cache.delete(file.path);
    }
    
    clear(): void {
        this.cache.clear();
    }
}
```

**Impact**:
- First resolution: ~0.5ms
- Cached resolution: ~0.01ms
- **50x speedup** for repeated lookups

**When to invalidate**:
- File modified: Invalidate that file only
- File renamed: Invalidate old and new paths
- Settings changed: Clear entire cache
- Tags changed: Invalidate that file only

### 2. Observer Management

**Centralized ObserverManager**

Lifecycle management for all MutationObservers:

```typescript
class ObserverManager {
    private observers = new Set<MutationObserver>();
    
    create(
        target: Node,
        callback: MutationCallback,
        options?: MutationObserverInit
    ): MutationObserver {
        const observer = new MutationObserver(callback);
        observer.observe(target, options || {
            childList: true,
            subtree: true
        });
        this.observers.add(observer);
        return observer;
    }
    
    disconnect(observer: MutationObserver): void {
        observer.disconnect();
        this.observers.delete(observer);
    }
    
    disconnectAll(): void {
        this.observers.forEach(obs => obs.disconnect());
        this.observers.clear();
    }
}
```

**Benefits**:
- No orphaned observers (memory leaks)
- Clean shutdown when plugin unloads
- Easy to disable all observers

**Usage**:
```typescript
// In renderer
this.plugin.observerManager.create(container, (mutations) => {
    this.handleMutations(mutations);
});

// In plugin onunload
this.observerManager.disconnectAll();
```

### 3. Efficient DOM Queries

**Problem**: Searching entire document is slow.

**Solution**: Scope queries to relevant containers.

```typescript
// ❌ Slow - searches entire document
document.querySelectorAll('.internal-link');

// ✅ Fast - searches specific container
markdownView.containerEl.querySelectorAll('.internal-link');
```

**In practice**:
```typescript
class WikilinkRenderer {
    register(): void {
        // Only observe markdown view containers
        this.plugin.workspace.iterateAllLeaves(leaf => {
            if (leaf.view.getViewType() === 'markdown') {
                const container = leaf.view.containerEl;
                this.observeContainer(container);
            }
        });
    }
    
    private observeContainer(container: HTMLElement): void {
        this.observerManager.create(container, (mutations) => {
            // Only process mutations in this container
            this.handleMutations(mutations);
        });
    }
}
```

### 4. Duplicate Prevention

**Problem**: Adding icon multiple times to same element.

**Solution**: Check before adding.

```typescript
private addIcon(element: HTMLElement, file: TFile): void {
    // Check if icon already exists
    if (element.querySelector('.si-icon')) {
        return;  // Already has icon
    }
    
    // Get icon name
    const iconName = this.resolver.resolveIcon(file);
    if (!iconName) return;
    
    // Create and add
    const icon = this.factory.create(iconName);
    element.insertBefore(icon, element.firstChild);
}
```

**Benefits**:
- Prevents duplicate DOM elements
- Prevents duplicate icon lookups
- Cleaner DOM structure

### 5. Lazy Initialization

**Problem**: Loading all renderers even if disabled.

**Solution**: Only create and register enabled renderers.

```typescript
class IconRenderer {
    register(): void {
        const { settings } = this.plugin;
        
        // Only create enabled renderers
        if (settings.renderWikilinks) {
            this.wikilinkRenderer = new WikilinkRenderer(this);
            this.wikilinkRenderer.register();
        }
        
        if (settings.renderFileView) {
            this.fileViewRenderer = new FileViewRenderer(this);
            this.fileViewRenderer.register();
        }
        
        // etc.
    }
}
```

**Impact**:
- Fewer observers active
- Less memory usage
- Faster plugin load

### 6. Debouncing High-Frequency Events

**Problem**: Some events fire very frequently (e.g., metadata cache changes during bulk import).

**Solution**: Debounce updates.

```typescript
class IconRenderer {
    private updateTimeout: number | null = null;
    
    scheduleUpdate(file: TFile): void {
        // Clear pending update
        if (this.updateTimeout !== null) {
            clearTimeout(this.updateTimeout);
        }
        
        // Schedule new update
        this.updateTimeout = setTimeout(() => {
            this.updateFile(file);
            this.updateTimeout = null;
        }, 50);  // 50ms debounce
    }
}
```

**Use cases**:
- Metadata cache updates
- Settings changes
- Bulk file operations

## Challenges

### Challenge 1: Cache Invalidation

**Problem**: Knowing when to invalidate cache is complex.

**Cases to handle**:
- File modified (frontmatter might change)
- File renamed (path changes, folder might change)
- File moved (folder changes)
- Settings changed (tag/folder mappings change)
- Tag added/removed

**Solution**: Conservative invalidation:

```typescript
// File modified - might affect frontmatter or tags
this.registerEvent(
    this.app.vault.on('modify', (file) => {
        this.resolver.invalidate(file);
        this.renderer.updateFile(file);
    })
);

// Settings changed - everything might be affected
async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
    this.resolver.clear();
    this.renderer.refreshAll();
}
```

Trade-off: Some unnecessary invalidations, but ensures correctness.

### Challenge 2: Observer Performance

**Problem**: MutationObserver callbacks can fire hundreds of times per second.

**Solution**: Efficient callback implementation:

```typescript
private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
        // Skip text nodes and comments
        if (mutation.type !== 'childList') continue;
        
        // Process added nodes only
        for (const node of mutation.addedNodes) {
            // Skip non-elements
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            
            // Quick element type check
            const element = node as HTMLElement;
            if (!element.classList) continue;
            
            // Process element
            this.processElement(element);
        }
    }
}
```

**Optimizations**:
- Early returns for irrelevant mutations
- Type checks before casting
- Skip removed nodes (we don't care)
- Batch processing when possible

### Challenge 3: Memory Leaks

**Problem**: Observers, event listeners, and caches can leak memory.

**Solution**: Proper cleanup in `onunload`:

```typescript
class SimpleIconsPlugin extends Plugin {
    onunload(): void {
        // 1. Disconnect all observers
        this.observerManager.disconnectAll();
        
        // 2. Unregister all renderers
        this.iconRenderer.unregister();
        
        // 3. Clear caches
        this.iconResolver.clear();
        
        // 4. Remove event listeners (handled by registerEvent)
        
        // 5. Clear references
        this.iconRenderer = null;
        this.iconResolver = null;
    }
}
```

**Testing**: Load/unload plugin repeatedly and check memory in DevTools.

### Challenge 4: Initial Load Performance

**Problem**: Rendering 1000s of icons on startup can freeze UI.

**Solution**: Progressive rendering:

```typescript
class FileListRenderer {
    register(): void {
        // Render visible items immediately
        this.renderVisibleItems();
        
        // Render rest on next idle
        requestIdleCallback(() => {
            this.renderAllItems();
        });
    }
    
    private renderVisibleItems(): void {
        const container = this.getContainer();
        const visibleItems = this.getVisibleElements(container);
        visibleItems.forEach(item => this.addIcon(item));
    }
}
```

**Impact**:
- UI responsive immediately
- Full rendering happens in background
- User doesn't notice delay

## Results

### Performance Benchmarks

Tested with different vault sizes:

**Small Vault (100 files)**
- Initial load: <50ms
- Icon update: <5ms
- Memory: +1MB
- CPU: Negligible

**Medium Vault (1000 files)**
- Initial load: <150ms
- Icon update: <10ms
- Memory: +5MB
- CPU: <1%

**Large Vault (5000 files)**
- Initial load: <500ms
- Icon update: <20ms
- Memory: +15MB
- CPU: <2%

### Before/After Comparison

| Operation | Before | After | Improvement |
|-----------|--------|-------|-------------|
| Icon resolution (first) | 0.5ms | 0.5ms | - |
| Icon resolution (cached) | 0.5ms | 0.01ms | **50x** |
| Bulk update (100 files) | 200ms | 50ms | **4x** |
| Memory (1000 files) | 20MB | 5MB | **4x** |
| Observer overhead | 5% CPU | <1% CPU | **5x** |

### User Experience

✅ **Instant**: Icons appear immediately  
✅ **Smooth**: No UI lag or stuttering  
✅ **Responsive**: Settings changes apply quickly  
✅ **Stable**: No memory leaks over time  

## Key Learnings

### 1. Caching is Essential

Even simple Map-based caching provides huge gains:
- 50x speedup for repeated lookups
- Negligible memory cost
- Easy to implement and maintain

### 2. Observer Management is Critical

MutationObserver can easily cause memory leaks:
- Always track observers
- Always disconnect on cleanup
- Use centralized manager

### 3. Scope Your Queries

Don't search entire document:
- Query specific containers
- Use classList checks before querySelector
- Return early from callbacks

### 4. Measure Everything

Use browser DevTools to:
- Profile CPU usage
- Monitor memory over time
- Identify slow operations
- Verify optimizations work

### 5. Progressive Enhancement

Don't block UI on initial load:
- Render visible items first
- Use requestIdleCallback for rest
- User perceives faster load

## Next Steps

### Further Optimizations

- [ ] Virtual scrolling for large file lists
- [ ] Icon sprite sheets (reduce DOM nodes)
- [ ] Web Workers for heavy computation
- [ ] IndexedDB for persistent cache

### Monitoring

- [ ] Add performance metrics tracking
- [ ] Log slow operations (>100ms)
- [ ] Add debug mode with timing info
- [ ] Create performance test suite

### Advanced Caching

- [ ] LRU cache with size limit
- [ ] Persistent cache across sessions
- [ ] Preload icons for recently accessed files
- [ ] Smart prefetching

## Code Examples

### Performance Monitoring

Add timing wrapper:

```typescript
class PerformanceMonitor {
    static measure(name: string, fn: () => void): void {
        const start = performance.now();
        fn();
        const duration = performance.now() - start;
        
        if (duration > 100) {
            console.warn(`Slow operation: ${name} took ${duration}ms`);
        }
    }
}

// Usage
PerformanceMonitor.measure('Update file list', () => {
    this.updateFileList();
});
```

### Memory Profiling

Check memory usage:

```typescript
class MemoryMonitor {
    private baseline: number = 0;
    
    start(): void {
        if (performance.memory) {
            this.baseline = performance.memory.usedJSHeapSize;
        }
    }
    
    check(label: string): void {
        if (performance.memory) {
            const current = performance.memory.usedJSHeapSize;
            const diff = (current - this.baseline) / 1024 / 1024;
            console.log(`${label}: ${diff.toFixed(2)}MB`);
        }
    }
}
```

## References

- [MDN: Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
- [MDN: MutationObserver Performance](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#performance)
- [Chrome DevTools: Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Related Entries**: [Icon Resolution](2024-11-03-icon-resolution.md), [Renderer System](2024-11-03-renderer-system.md)

