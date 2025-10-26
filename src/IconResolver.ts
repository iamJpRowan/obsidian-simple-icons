import { App, CachedMetadata, TFile } from "obsidian"
import { IconCache, PluginSettings } from "./types"

export class IconResolver {
  private app: App
  private settings: PluginSettings
  private cache: IconCache
  private validIconNames: Set<string>

  constructor(app: App, settings: PluginSettings) {
    this.app = app
    this.settings = settings
    this.cache = {}
    // Initialize with a basic set - will be populated lazily
    this.validIconNames = this.getLucideIconNames()
  }

  /**
   * Get list of valid Lucide icon names
   * Uses a curated list of common Lucide icons
   */
  private getLucideIconNames(): Set<string> {
    // Common Lucide icons that are available in Obsidian
    const commonIcons = [
      "home",
      "folder",
      "file",
      "file-text",
      "book",
      "book-open",
      "bookmark",
      "calendar",
      "calendar-days",
      "clock",
      "timer",
      "alarm-clock",
      "star",
      "heart",
      "flag",
      "tag",
      "hash",
      "at-sign",
      "check",
      "check-circle",
      "x",
      "x-circle",
      "alert-circle",
      "alert-triangle",
      "info",
      "settings",
      "sliders",
      "tool",
      "wrench",
      "hammer",
      "user",
      "users",
      "user-plus",
      "user-check",
      "mail",
      "inbox",
      "send",
      "message-circle",
      "message-square",
      "search",
      "zoom-in",
      "zoom-out",
      "filter",
      "edit",
      "edit-2",
      "edit-3",
      "pen-tool",
      "pen-line",
      "trash",
      "trash-2",
      "archive",
      "inbox",
      "save",
      "download",
      "upload",
      "share",
      "share-2",
      "copy",
      "clipboard",
      "scissors",
      "paperclip",
      "link",
      "link-2",
      "external-link",
      "anchor",
      "image",
      "file-image",
      "file-video",
      "file-audio",
      "code",
      "code-2",
      "terminal",
      "command",
      "database",
      "server",
      "cpu",
      "folder-open",
      "folder-plus",
      "folder-minus",
      "folder-archive",
      "arrow-right",
      "arrow-left",
      "arrow-up",
      "arrow-down",
      "chevron-right",
      "chevron-left",
      "chevron-up",
      "chevron-down",
      "plus",
      "minus",
      "circle",
      "square",
      "triangle",
      "eye",
      "eye-off",
      "lock",
      "unlock",
      "key",
      "bell",
      "bell-off",
      "volume",
      "volume-2",
      "volume-x",
      "sun",
      "moon",
      "cloud",
      "zap",
      "droplet",
      "flame",
      "map",
      "map-pin",
      "compass",
      "globe",
      "navigation",
      "list",
      "list-ordered",
      "layout",
      "grid",
      "columns",
      "maximize",
      "minimize",
      "move",
      "rotate-cw",
      "rotate-ccw",
      "refresh-cw",
      "loader",
      "more-horizontal",
      "more-vertical",
      "play",
      "pause",
      "stop",
      "skip-forward",
      "skip-back",
      "award",
      "target",
      "trophy",
      "gift",
      "package",
      "shopping-cart",
      "shopping-bag",
      "credit-card",
      "dollar-sign",
      "briefcase",
      "hard-drive",
      "monitor",
      "smartphone",
      "tablet",
      "wifi",
      "bluetooth",
      "cast",
      "radio",
      "tv",
      "camera",
      "video",
      "mic",
      "headphones",
      "speaker",
    ]

    return new Set(commonIcons)
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

    if (typeof iconName === "string" && this.isValidIcon(iconName)) {
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
      if (fileTags.includes(mapping.tag) && this.isValidIcon(mapping.icon)) {
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
          if (this.isValidIcon(mapping.icon)) {
            deepestMatch = { depth, icon: mapping.icon }
          }
        }
      }
    }

    return deepestMatch?.icon || null
  }

  /**
   * Validates if an icon name exists in Lucide icon set
   */
  isValidIcon(iconName: string): boolean {
    return this.validIconNames.has(iconName)
  }

  /**
   * Get all valid Lucide icon names
   */
  getValidIconNames(): string[] {
    return Array.from(this.validIconNames)
  }
}
