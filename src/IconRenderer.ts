import {
  App,
  Component,
  MarkdownPostProcessorContext,
  MarkdownView,
  TFile,
  setIcon,
} from "obsidian"
import { IconResolver } from "./IconResolver"
import { PluginSettings } from "./types"

export class IconRenderer extends Component {
  private app: App
  private iconResolver: IconResolver
  private settings: PluginSettings
  private observers: MutationObserver[] = []

  constructor(app: App, iconResolver: IconResolver, settings: PluginSettings) {
    super()
    this.app = app
    this.iconResolver = iconResolver
    this.settings = settings
  }

  updateSettings(settings: PluginSettings): void {
    this.settings = settings
  }

  /**
   * Initialize all rendering hooks
   */
  initializeRendering(): void {
    this.registerFileViewRendering()
    this.registerFileListRendering()
    this.registerSuggestRendering()
    this.registerMetadataLinkRendering()
  }

  /**
   * Clean up all observers and listeners
   */
  onunload(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }

  /**
   * Create icon element for a file
   */
  private createIconElement(iconName: string): HTMLElement {
    const iconEl = document.createElement("span")
    iconEl.addClass("file-icon")
    setIcon(iconEl, iconName)
    return iconEl
  }

  /**
   * Render icon for wikilink (used in markdown post processor)
   */
  renderWikilinkIcon(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    if (!this.settings.renderInWikilinks) return

    // Find all internal links in the element (both <a> and <div> variants)
    const links = el.querySelectorAll("a.internal-link, div.internal-link")
    links.forEach(link => {
      const href = link.getAttribute("href") || link.getAttribute("data-href")
      if (!href) return

      // Resolve the file from the link
      const file = this.app.metadataCache.getFirstLinkpathDest(
        href,
        ctx.sourcePath
      )
      if (!file) return

      const iconName = this.iconResolver.getIconForFile(file)
      if (!iconName) return

      // Check if icon already exists
      if (link.querySelector(".file-icon")) return

      // Create and prepend icon
      const iconEl = this.createIconElement(iconName)
      link.prepend(iconEl)
    })
  }

  /**
   * Register file view rendering (tabs and inline titles)
   */
  private registerFileViewRendering(): void {
    if (!this.settings.renderInFileView) return

    // Use workspace event to detect when files are opened or changed
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.updateFileViewIcons()
      })
    )

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.updateFileViewIcons()
      })
    )

    // Initial render
    setTimeout(() => this.updateFileViewIcons(), 100)
  }

  /**
   * Update icons in file views (tabs and titles)
   */
  private updateFileViewIcons(): void {
    if (!this.settings.renderInFileView) return

    // Update all markdown view tabs by iterating through leaves
    const leaves = this.app.workspace.getLeavesOfType("markdown")
    leaves.forEach(leaf => {
      if (leaf.view instanceof MarkdownView && leaf.view.file) {
        this.updateTabHeaderForLeaf(leaf)
      }
    })

    // Update inline titles in editor
    const inlineTitles = document.querySelectorAll(".inline-title")
    inlineTitles.forEach(title => {
      this.updateInlineTitleIcon(title as HTMLElement)
    })
  }

  /**
   * Update icon in workspace tab header for a specific leaf
   */
  private updateTabHeaderForLeaf(leaf: any): void {
    if (!(leaf.view instanceof MarkdownView)) return

    const file = leaf.view.file
    if (!file) return

    // Find the tab header by matching the file basename with tab header text
    const allHeaders = Array.from(
      document.querySelectorAll(".workspace-tab-header-inner-title")
    )

    let viewHeader: Element | null = null
    for (const header of allHeaders) {
      const titleText = header.textContent?.trim()
      if (titleText === file.basename || titleText === file.name) {
        viewHeader = header
        break
      }
    }

    if (!viewHeader) return

    const iconName = this.iconResolver.getIconForFile(file)

    // Remove existing icon
    const existingIcon = viewHeader.querySelector(".file-icon")
    if (existingIcon) {
      existingIcon.remove()
    }

    if (iconName) {
      const iconEl = this.createIconElement(iconName)
      viewHeader.prepend(iconEl)
    }
  }

  /**
   * Update icon in inline title
   */
  private updateInlineTitleIcon(title: HTMLElement): void {
    const leaf = this.app.workspace.activeLeaf
    if (!leaf || !(leaf.view instanceof MarkdownView)) return

    const file = leaf.view.file
    if (!file) return

    const iconName = this.iconResolver.getIconForFile(file)

    // Remove existing icon
    const existingIcon = title.querySelector(".file-icon")
    if (existingIcon) {
      existingIcon.remove()
    }

    if (iconName) {
      const iconEl = this.createIconElement(iconName)
      title.prepend(iconEl)
    }
  }

  /**
   * Register file list rendering (explorer and search)
   */
  private registerFileListRendering(): void {
    if (!this.settings.renderInFileLists) return

    // Initial render
    setTimeout(() => {
      this.updateFileExplorerIcons()
      this.setupFileExplorerObserver()
    }, 500)

    // Update on file changes
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        setTimeout(() => this.updateFileExplorerIcons(), 100)
      })
    )

    this.registerEvent(
      this.app.metadataCache.on("changed", file => {
        setTimeout(() => this.updateFileExplorerIcons(), 100)
      })
    )
  }

  /**
   * Update icons in file explorer
   */
  private updateFileExplorerIcons(): void {
    if (!this.settings.renderInFileLists) return

    // File explorer
    const navFiles = document.querySelectorAll(".nav-file-title")
    navFiles.forEach(navFile => {
      this.updateNavFileIcon(navFile as HTMLElement)
    })

    // Search results
    const searchResults = document.querySelectorAll(".search-result-file-title")
    searchResults.forEach(result => {
      this.updateSearchResultIcon(result as HTMLElement)
    })
  }

  /**
   * Update icon for nav file item
   */
  private updateNavFileIcon(navFile: HTMLElement): void {
    const fileTitle = navFile.getAttribute("data-path")
    if (!fileTitle) return

    const file = this.app.vault.getAbstractFileByPath(fileTitle)
    if (!(file instanceof TFile)) return

    const iconName = this.iconResolver.getIconForFile(file)

    // Remove existing icon
    const existingIcon = navFile.querySelector(".file-icon")
    if (existingIcon) {
      existingIcon.remove()
    }

    if (iconName) {
      const iconEl = this.createIconElement(iconName)
      const titleContent = navFile.querySelector(".nav-file-title-content")
      if (titleContent) {
        titleContent.prepend(iconEl)
      }
    }
  }

  /**
   * Update icon for search result
   */
  private updateSearchResultIcon(result: HTMLElement): void {
    const filePath = result.getAttribute("data-path")
    if (!filePath) return

    const file = this.app.vault.getAbstractFileByPath(filePath)
    if (!(file instanceof TFile)) return

    const iconName = this.iconResolver.getIconForFile(file)

    // Remove existing icon
    const existingIcon = result.querySelector(".file-icon")
    if (existingIcon) {
      existingIcon.remove()
    }

    if (iconName) {
      const iconEl = this.createIconElement(iconName)
      result.prepend(iconEl)
    }
  }

  /**
   * Setup mutation observer for file explorer
   */
  private setupFileExplorerObserver(): void {
    const fileExplorer = document.querySelector(".nav-files-container")
    if (!fileExplorer) return

    const observer = new MutationObserver(() => {
      this.updateFileExplorerIcons()
    })

    observer.observe(fileExplorer, {
      childList: true,
      subtree: true,
    })

    this.observers.push(observer)
  }

  /**
   * Register suggestion rendering (autofill)
   */
  private registerSuggestRendering(): void {
    if (!this.settings.renderInWikilinks) return

    let debounceTimer: NodeJS.Timeout | null = null

    // Set up mutation observer for suggestion containers
    const observer = new MutationObserver(mutations => {
      // Efficiently check if any mutation involves suggestion containers
      // Skip mutations related to search results or file explorer
      let hasSuggestions = false

      for (const mutation of mutations) {
        // Skip if mutation is within search results or file explorer
        if (mutation.target instanceof Element) {
          const target = mutation.target as Element
          if (
            target.closest(".search-results") ||
            target.closest(".nav-files-container")
          ) {
            continue
          }

          // Check if mutation is within or related to a suggestion container
          if (
            target.closest(".suggestion-container") ||
            target.classList?.contains("suggestion-container") ||
            target.classList?.contains("suggestion")
          ) {
            hasSuggestions = true
            break
          }
        }

        // Check added nodes for suggestion containers or items
        const addedNodes = Array.from(mutation.addedNodes)
        for (const node of addedNodes) {
          if (node instanceof Element) {
            if (
              node.classList?.contains("suggestion-container") ||
              node.classList?.contains("suggestion-item") ||
              node.querySelector?.(".suggestion-container") !== null ||
              node.querySelector?.(".suggestion-item") !== null
            ) {
              hasSuggestions = true
              break
            }
          }
        }
        if (hasSuggestions) break
      }

      if (hasSuggestions) {
        // Debounce to avoid excessive updates
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
          this.updateSuggestionIcons()
          debounceTimer = null
        }, 50)
      }
    })

    // Observe the document body for suggestion popups
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    this.observers.push(observer)
  }

  /**
   * Update icons in suggestion items
   */
  private updateSuggestionIcons(): void {
    if (!this.settings.renderInWikilinks) return

    const suggestions = document.querySelectorAll(".suggestion-item")
    suggestions.forEach(suggestion => {
      const titleEl = suggestion.querySelector(".suggestion-title")
      if (!titleEl) return

      // Check if icon already exists in the title element
      const existingIcon = titleEl.querySelector(".file-icon")

      // Try to get file path from data-path attribute
      let filePath = suggestion.getAttribute("data-path")

      // If data-path doesn't exist, try to get it from the suggestion content
      if (!filePath) {
        const auxEl = suggestion.querySelector(".suggestion-aux")
        if (auxEl) {
          filePath = auxEl.textContent?.trim() || null
        }
      }

      // If still no file path, try getting it from the title text
      if (!filePath) {
        const titleText = titleEl.textContent?.trim()
        if (titleText) {
          // Remove icon text if it exists in the title
          const titleTextClean = titleText.replace(/^\s*$/, "").trim()
          if (titleTextClean) {
            // Try to resolve the file by title
            const file = this.app.metadataCache.getFirstLinkpathDest(
              titleTextClean,
              ""
            )
            if (file) {
              filePath = file.path
            }
          }
        }
      }

      if (!filePath) {
        // No file path found, remove any existing icon
        if (existingIcon) {
          existingIcon.remove()
        }
        return
      }

      const file = this.app.vault.getAbstractFileByPath(filePath)
      if (!(file instanceof TFile)) {
        // Not a valid file, remove any existing icon
        if (existingIcon) {
          existingIcon.remove()
        }
        return
      }

      const iconName = this.iconResolver.getIconForFile(file)

      if (iconName) {
        // Only add/update icon if it doesn't exist or is different
        if (!existingIcon) {
          const iconEl = this.createIconElement(iconName)
          titleEl.prepend(iconEl)
        }
        // If icon exists, we keep it (assume it's correct to avoid flicker)
      } else {
        // No icon needed, remove if exists
        if (existingIcon) {
          existingIcon.remove()
        }
      }
    })
  }

  /**
   * Register metadata link rendering (properties/frontmatter)
   */
  private registerMetadataLinkRendering(): void {
    if (!this.settings.renderInWikilinks) return

    let debounceTimer: NodeJS.Timeout | null = null

    // Set up mutation observer for metadata link elements
    const observer = new MutationObserver(mutations => {
      let hasMetadata = false

      for (const mutation of mutations) {
        // Check if mutation is within or involves metadata-link-inner elements
        if (mutation.target instanceof Element) {
          const target = mutation.target as Element
          if (
            target.closest(".metadata-link-inner") ||
            target.closest(".metadata-container") ||
            target.closest(".metadata-property") ||
            target.classList?.contains("metadata-link-inner") ||
            target.classList?.contains("metadata-container") ||
            target.classList?.contains("metadata-property")
          ) {
            hasMetadata = true
            break
          }
        }

        // Check added nodes for metadata elements
        const addedNodes = Array.from(mutation.addedNodes)
        for (const node of addedNodes) {
          if (node instanceof Element) {
            if (
              node.classList?.contains("metadata-link-inner") ||
              node.classList?.contains("metadata-container") ||
              node.classList?.contains("metadata-property") ||
              node.querySelector?.(".metadata-link-inner") !== null ||
              node.querySelector?.(".metadata-container") !== null ||
              node.querySelector?.(".metadata-property") !== null
            ) {
              hasMetadata = true
              break
            }
          }
        }
        if (hasMetadata) break
      }

      if (hasMetadata) {
        // Debounce to avoid excessive updates
        if (debounceTimer) {
          clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
          this.updateMetadataLinkIcons()
          debounceTimer = null
        }, 50)
      }
    })

    // Observe the document body for metadata changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    this.observers.push(observer)

    // Initial render
    setTimeout(() => this.updateMetadataLinkIcons(), 100)

    // Also update on active leaf change
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        setTimeout(() => this.updateMetadataLinkIcons(), 100)
      })
    )
  }

  /**
   * Update icons in metadata links
   */
  private updateMetadataLinkIcons(): void {
    if (!this.settings.renderInWikilinks) return

    // Get the active file for path resolution
    const activeFile = this.app.workspace.getActiveFile()
    if (!activeFile) return

    // Find all metadata link divs (specifically target metadata-link-inner)
    const metadataLinks = document.querySelectorAll(
      "div.metadata-link-inner.internal-link"
    )

    metadataLinks.forEach(link => {
      // Check if icon already exists
      if (link.querySelector(".file-icon")) return

      // Get the data-href attribute (metadata links use data-href, not href)
      const href = link.getAttribute("data-href")
      if (!href) return

      // Resolve the file from the link
      const file = this.app.metadataCache.getFirstLinkpathDest(
        href,
        activeFile.path
      )
      if (!file) return

      const iconName = this.iconResolver.getIconForFile(file)
      if (!iconName) return

      // Create and prepend icon
      const iconEl = this.createIconElement(iconName)
      link.prepend(iconEl)
    })
  }
}
