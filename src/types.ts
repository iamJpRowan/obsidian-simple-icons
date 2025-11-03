/**
 * types.ts
 *
 * This file defines all TypeScript interfaces and types used throughout the plugin.
 * It provides type safety for settings, mappings, and caching structures.
 *
 * Key types defined here:
 * - TagMapping: Associates a tag with an icon name
 * - FolderMapping: Associates a folder path with an icon name
 * - PluginSettings: Complete configuration for the plugin
 * - IconCache: Cache of resolved icons for performance
 */

/**
 * Maps a tag to an icon name for files with that tag
 *
 * Tags are checked in priority order (as defined in the settings array).
 * The tag name should not include the '#' prefix.
 */
export interface TagMapping {
  /** The tag name to match (without # prefix) */
  tag: string
  /** The Lucide icon name to display for files with this tag */
  icon: string
}

/**
 * Maps a folder path to an icon name for files in that folder
 *
 * Paths are relative to the vault root. When multiple folders match,
 * the deepest (most specific) path takes priority.
 */
export interface FolderMapping {
  /** The folder path relative to vault root (e.g., "projects/frontend") */
  path: string
  /** The Lucide icon name to display for files in this folder */
  icon: string
}

/**
 * Complete plugin settings configuration
 *
 * Defines all configurable options for the plugin including feature toggles,
 * rendering locations, and icon association mappings.
 */
export interface PluginSettings {
  // Feature toggles
  /** Whether to read icons from file frontmatter */
  enableFrontmatter: boolean
  /** The frontmatter property name to read icon from (default: "icon") */
  frontmatterProperty: string
  /** Whether to resolve icons based on file tags */
  enableTags: boolean
  /** Whether to resolve icons based on folder paths */
  enableFolders: boolean

  // Rendering location toggles
  /** Whether to display icons next to wikilinks in reading and live preview mode */
  renderInWikilinks: boolean
  /** Whether to display icons in file view (tab headers and inline titles) */
  renderInFileView: boolean
  /** Whether to display icons in file lists (explorer, search results) */
  renderInFileLists: boolean

  // Associations
  /** Ordered list of tag-to-icon mappings (checked in priority order) */
  tagMappings: TagMapping[]
  /** List of folder-to-icon mappings (deepest match wins) */
  folderMappings: FolderMapping[]
}

/**
 * Default settings used when plugin is first installed
 *
 * Frontmatter is enabled by default, and all rendering locations are enabled.
 * Tags and folders are disabled by default and must be explicitly enabled.
 */
export const DEFAULT_SETTINGS: PluginSettings = {
  enableFrontmatter: true,
  frontmatterProperty: "icon",
  enableTags: false,
  enableFolders: false,
  renderInWikilinks: true,
  renderInFileView: true,
  renderInFileLists: true,
  tagMappings: [],
  folderMappings: [],
}

/**
 * Cache for resolved icons indexed by file path
 *
 * This cache stores the result of icon resolution for each file to avoid
 * re-computing icons multiple times. Values can be a string (icon name) or
 * null (no icon found). The cache is cleared when settings change.
 */
export interface IconCache {
  [filePath: string]: string | null
}
