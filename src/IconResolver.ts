import { App, CachedMetadata, TFile } from "obsidian"
import { IconCache, PluginSettings } from "./types"

export class IconResolver {
  private app: App
  private settings: PluginSettings
  private cache: IconCache

  constructor(app: App, settings: PluginSettings) {
    this.app = app
    this.settings = settings
    this.cache = {}
  }

  /**
   * Updates settings reference and clears cache
   */
  updateSettings(settings: PluginSettings): void {
    this.settings = settings
    this.clearCache()
  }

  /**
   * Clears the entire cache
   */
  clearCache(): void {
    this.cache = {}
  }

  /**
   * Invalidates cache for a specific file
   */
  invalidateFile(file: TFile): void {
    delete this.cache[file.path]
  }

  /**
   * Main method to resolve icon for a file
   * Priority: frontmatter > tags > folders
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
   * Get icon from frontmatter property
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
   * Get icon from tags based on priority order
   */
  private getIconFromTags(metadata: CachedMetadata): string | null {
    if (!metadata.tags || metadata.tags.length === 0) {
      return null
    }

    // Get all tags from the file (without # prefix)
    const fileTags = metadata.tags.map(t => t.tag.replace(/^#/, ""))

    // Check each tag mapping in priority order
    for (const mapping of this.settings.tagMappings) {
      if (
        fileTags.includes(mapping.tag) &&
        mapping.icon &&
        mapping.icon.trim() !== ""
      ) {
        return mapping.icon
      }
    }

    return null
  }

  /**
   * Get icon from folder path (deepest match wins)
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
   * Get all valid icon names for the picker
   * Returns an empty array - no static list to maintain.
   * Users type icon names directly in the text field.
   */
  getValidIconNames(): string[] {
    // Return empty array - users type icon names manually in text input
    // No maintenance required
    return []
  }
}
