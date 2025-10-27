/**
 * IconResolver.ts
 *
 * This file provides the IconResolver class that determines which icon should
 * be displayed for each file based on plugin settings. The resolver implements
 * a multi-source resolution strategy with caching for performance:
 *
 * 1. Frontmatter (highest priority) - read icon from file's frontmatter
 * 2. Tags - match file tags to configured tag-to-icon mappings
 * 3. Folders (lowest priority) - match file path to configured folder mappings
 *
 * Results are cached to minimize metadata lookups and improve performance.
 */

import { App, CachedMetadata, TFile } from "obsidian"
import { IconCache, PluginSettings } from "./types"

/**
 * Resolves the appropriate icon for files based on settings and metadata
 *
 * The IconResolver implements a priority-based resolution system that checks
 * multiple sources (frontmatter, tags, folders) to determine which icon should
 * be displayed for a file. All results are cached to improve performance when
 * the same file is rendered multiple times. The cache is invalidated when
 * settings change or when individual files are updated.
 */
export class IconResolver {
  private app: App
  private settings: PluginSettings
  private cache: IconCache

  /**
   * Creates a new IconResolver instance
   *
   * @param app - The Obsidian App instance for accessing metadata
   * @param settings - The current plugin settings
   */
  constructor(app: App, settings: PluginSettings) {
    this.app = app
    this.settings = settings
    this.cache = {}
  }

  /**
   * Updates settings and clears the cache
   *
   * When settings change, the cache must be cleared to ensure icons are
   * resolved using the new configuration. This is called when the user
   * modifies settings in the settings tab.
   *
   * @param settings - The new plugin settings
   */
  updateSettings(settings: PluginSettings): void {
    this.settings = settings
    this.clearCache()
  }

  /**
   * Clears the entire icon cache
   *
   * Forces all icons to be re-resolved from metadata on the next lookup.
   * This is useful when settings change or when you need to force a full refresh.
   */
  clearCache(): void {
    this.cache = {}
  }

  /**
   * Invalidates the cache entry for a specific file
   *
   * Removes a single file from the cache so it will be re-resolved on the
   * next lookup. This is called when a file's metadata changes.
   *
   * @param file - The file whose cache entry should be invalidated
   */
  invalidateFile(file: TFile): void {
    delete this.cache[file.path]
  }

  /**
   * Resolves the icon for a file using priority-based resolution
   *
   * This is the main method for determining which icon to display for a file.
   * It checks three sources in priority order:
   * 1. Frontmatter - highest priority, reads icon from file frontmatter
   * 2. Tags - matches file tags to configured tag-to-icon mappings
   * 3. Folders - matches file path to configured folder-to-icon mappings
   *
   * Results are cached to avoid re-computing the same icon multiple times.
   * The cache is automatically cleared when settings change.
   *
   * @param file - The file to resolve an icon for
   * @returns The icon name to display, or null if no matching icon is found
   */
  getIconForFile(file: TFile): string | null {
    // Check cache first
    if (this.cache[file.path] !== undefined) {
      return this.cache[file.path]
    }

    const metadata = this.app.metadataCache.getFileCache(file)
    let icon: string | null = null

    // 1. Check frontmatter (highest priority)
    if (this.settings.enableFrontmatter && metadata?.frontmatter) {
      icon = this.getIconFromFrontmatter(metadata)
      if (icon) {
        this.cache[file.path] = icon
        return icon
      }
    }

    // 2. Check tags
    if (this.settings.enableTags && metadata) {
      icon = this.getIconFromTags(metadata)
      if (icon) {
        this.cache[file.path] = icon
        return icon
      }
    }

    // 3. Check folders (lowest priority)
    if (this.settings.enableFolders) {
      icon = this.getIconFromFolder(file)
      if (icon) {
        this.cache[file.path] = icon
        return icon
      }
    }

    // Cache null result
    this.cache[file.path] = null
    return null
  }

  /**
   * Extracts the icon name from a file's frontmatter
   *
   * Checks the file's frontmatter for an icon property (configurable in settings).
   * If found and not empty, returns the icon name. The property name is
   * configurable via the frontmatterProperty setting (defaults to "icon").
   *
   * @param metadata - The cached metadata for the file
   * @returns The icon name from frontmatter, or null if not found
   */
  private getIconFromFrontmatter(metadata: CachedMetadata): string | null {
    const property = this.settings.frontmatterProperty || "icon"
    const iconName = metadata.frontmatter?.[property]

    if (typeof iconName === "string" && iconName.trim() !== "") {
      return iconName
    }

    return null
  }

  /**
   * Resolves icon based on file tags using configured tag mappings
   *
   * Checks all tags on the file against the configured tag mappings in priority order.
   * Returns the icon associated with the first matching tag. Tags can come from:
   * 1. Inline tags in the document body (stored in metadata.tags)
   * 2. Frontmatter tags (stored in metadata.frontmatter.tags array)
   *
   * Tags are normalized by trimming whitespace and removing the '#' prefix if present.
   *
   * @param metadata - The cached metadata for the file
   * @returns The icon name from tag mapping, or null if no tags match
   */
  private getIconFromTags(metadata: CachedMetadata): string | null {
    const allTags: string[] = []

    // 1. Get inline tags (from document body like #tag)
    if (metadata.tags && metadata.tags.length > 0) {
      allTags.push(
        ...metadata.tags.map(t => {
          const tag = t.tag.trim()
          return tag.startsWith("#") ? tag.substring(1) : tag
        })
      )
    }

    // 2. Get frontmatter tags (from YAML tags array)
    if (metadata.frontmatter?.tags) {
      // Frontmatter tags can be an array or single string
      if (Array.isArray(metadata.frontmatter.tags)) {
        allTags.push(
          ...metadata.frontmatter.tags.map(tag => {
            if (typeof tag === "string") {
              const trimmed = tag.trim()
              return trimmed.startsWith("#") ? trimmed.substring(1) : trimmed
            }
            return String(tag).trim()
          })
        )
      } else if (typeof metadata.frontmatter.tags === "string") {
        const trimmed = metadata.frontmatter.tags.trim()
        allTags.push(trimmed.startsWith("#") ? trimmed.substring(1) : trimmed)
      }
    }

    if (allTags.length === 0) {
      return null
    }

    // Check each tag mapping in priority order
    for (const mapping of this.settings.tagMappings) {
      // Normalize the mapping tag by trimming and removing # prefix if present
      let normalizedMappingTag = mapping.tag.trim()
      if (normalizedMappingTag.startsWith("#")) {
        normalizedMappingTag = normalizedMappingTag.substring(1)
      }

      if (
        allTags.includes(normalizedMappingTag) &&
        mapping.icon &&
        mapping.icon.trim() !== ""
      ) {
        return mapping.icon
      }
    }

    return null
  }

  /**
   * Resolves icon based on file path using configured folder mappings
   *
   * Matches the file's path against configured folder paths. When multiple
   * folders match, the deepest (most specific) match takes priority. This allows
   * subfolders to override parent folder icons. Paths are normalized for
   * comparison by removing leading/trailing slashes.
   *
   * @param file - The file to resolve folder-based icon for
   * @returns The icon name from folder mapping, or null if no path matches
   */
  private getIconFromFolder(file: TFile): string | null {
    const filePath = file.path
    let deepestMatch: { depth: number; icon: string } | null = null

    for (const mapping of this.settings.folderMappings) {
      // Normalize paths for comparison
      const folderPath = mapping.path.replace(/^\//, "").replace(/\/$/, "")

      // Check if file is in this folder
      if (
        filePath.startsWith(folderPath + "/") ||
        filePath.startsWith(folderPath)
      ) {
        const depth = folderPath.split("/").length

        if (!deepestMatch || depth > deepestMatch.depth) {
          if (mapping.icon && mapping.icon.trim() !== "") {
            deepestMatch = { depth, icon: mapping.icon }
          }
        }
      }
    }

    return deepestMatch?.icon || null
  }

  /**
   * Returns the list of valid icon names for the icon picker modal
   *
   * Currently returns an empty array as there is no static list to maintain.
   * Users manually type icon names into the text input field. This design
   * avoids the need to maintain a complete list of all available Lucide icons.
   *
   * @returns Empty array - icon names are entered manually by users
   */
  getValidIconNames(): string[] {
    // Return empty array - users type icon names manually in text input
    // No maintenance required
    return []
  }
}
