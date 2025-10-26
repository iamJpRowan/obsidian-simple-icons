export interface TagMapping {
  tag: string
  icon: string
}

export interface FolderMapping {
  path: string
  icon: string
}

export interface PluginSettings {
  // Feature toggles
  enableFrontmatter: boolean
  frontmatterProperty: string
  enableTags: boolean
  enableFolders: boolean

  // Rendering location toggles
  renderInWikilinks: boolean
  renderInFileView: boolean
  renderInFileLists: boolean

  // Associations
  tagMappings: TagMapping[]
  folderMappings: FolderMapping[]
}

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

export interface IconCache {
  [filePath: string]: string | null
}
