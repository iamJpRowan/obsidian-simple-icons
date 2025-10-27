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
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

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
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
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

      // Check if icon already exists
      if (link.querySelector(".file-icon")) return

      // Resolve the file from the link
      const file = this.app.metadataCache.getFirstLinkpathDest(
        href,
        ctx.sourcePath
      )
      if (!file) return

      const iconName = this.iconResolver.getIconForFile(file)
      if (!iconName) return

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
        this.debouncedUpdate("fileview", () => {
          this.updateFileViewIcons()
        })
      })
    )

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.debouncedUpdate("fileview", () => {
          this.updateFileViewIcons()
        })
      })
    )

    // Single initial render
    setTimeout(() => this.updateFileViewIcons(), 200)
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
   * Optimized to use MutationObserver only for the file explorer container
   */
  private registerFileListRendering(): void {
    if (!this.settings.renderInFileLists) return

    // Single initial render after container is ready
    setTimeout(() => {
      this.updateFileExplorerIcons()
      this.setupFileExplorerObserver()
    }, 500)
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
   * Update icon for a single file in file explorer
   */
  updateSingleFileIcon(file: TFile): void {
    if (!this.settings.renderInFileLists) return

    // Find the specific nav-file-title element
    const navFiles = Array.from(document.querySelectorAll(".nav-file-title"))
    for (const navFile of navFiles) {
      const path = navFile.getAttribute("data-path")
      if (path === file.path) {
        this.updateNavFileIcon(navFile as HTMLElement)
        break
      }
    }
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
   * Optimized: Only observes .nav-files-container, not the entire document
   */
  private setupFileExplorerObserver(): void {
    const fileExplorer = document.querySelector(".nav-files-container")
    if (!fileExplorer) {
      // Retry after a delay if container not ready
      setTimeout(() => this.setupFileExplorerObserver(), 500)
      return
    }

    const observer = new MutationObserver(() => {
      this.debouncedUpdate("fileexplorer", () => {
        this.updateFileExplorerIcons()
      })
    })

    // Only observe the file explorer container, not document.body
    observer.observe(fileExplorer, {
      childList: true,
      subtree: true,
    })

    this.observers.push(observer)
  }

  /**
   * Register suggestion rendering (autofill)
   * Optimized: Observes document.body but filters aggressively
   */
  private registerSuggestRendering(): void {
    if (!this.settings.renderInWikilinks) return

    const observer = new MutationObserver(mutations => {
      // Fast filter: check if any mutation involves suggestions
      let hasSuggestions = false

      for (const mutation of mutations) {
        if (mutation.target instanceof Element) {
          const target = mutation.target as Element

          // Fast early exit for non-suggestion areas
          if (
            target.closest(".search-results") ||
            target.closest(".nav-files-container") ||
            target.closest(".metadata-container")
          ) {
            continue
          }

          // Check for suggestion containers
          if (
            target.classList?.contains("suggestion-container") ||
            target.classList?.contains("suggestion-item") ||
            target.closest(".suggestion-container")
          ) {
            hasSuggestions = true
            break
          }
        }

        // Check added nodes
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof Element) {
            if (
              node.classList?.contains("suggestion-container") ||
              node.classList?.contains("suggestion-item") ||
              node.querySelector?.(".suggestion-container")
            ) {
              hasSuggestions = true
              break
            }
          }
        }
        if (hasSuggestions) break
      }

      if (hasSuggestions) {
        this.debouncedUpdate("suggestions", () => {
          this.updateSuggestionIcons()
        })
      }
    })

    // Observe document.body for suggestion popups (unavoidable - they appear dynamically)
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

      // Skip if icon already exists
      if (titleEl.querySelector(".file-icon")) return

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
          const file = this.app.metadataCache.getFirstLinkpathDest(
            titleText,
            ""
          )
          if (file) {
            filePath = file.path
          }
        }
      }

      if (!filePath) return

      const file = this.app.vault.getAbstractFileByPath(filePath)
      if (!(file instanceof TFile)) return

      const iconName = this.iconResolver.getIconForFile(file)
      if (!iconName) return

      // Create and prepend icon
      const iconEl = this.createIconElement(iconName)
      titleEl.prepend(iconEl)
    })
  }

  /**
   * Register metadata link rendering (properties/frontmatter)
   * Optimized: Only observes metadata containers if they exist
   */
  private registerMetadataLinkRendering(): void {
    if (!this.settings.renderInWikilinks) return

    const observer = new MutationObserver(mutations => {
      let hasMetadata = false

      for (const mutation of mutations) {
        if (mutation.target instanceof Element) {
          const target = mutation.target as Element
          if (
            target.closest(".metadata-link-inner") ||
            target.closest(".metadata-container") ||
            target.classList?.contains("metadata-link-inner") ||
            target.classList?.contains("metadata-container")
          ) {
            hasMetadata = true
            break
          }
        }

        // Check added nodes
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof Element) {
            if (
              node.classList?.contains("metadata-link-inner") ||
              node.classList?.contains("metadata-container") ||
              node.querySelector?.(".metadata-link-inner")
            ) {
              hasMetadata = true
              break
            }
          }
        }
        if (hasMetadata) break
      }

      if (hasMetadata) {
        this.debouncedUpdate("metadata", () => {
          this.updateMetadataLinkIcons()
        })
      }
    })

    // Observe document.body for metadata changes (unavoidable - properties panel is dynamic)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    this.observers.push(observer)

    // Initial render
    setTimeout(() => this.updateMetadataLinkIcons(), 200)

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
      // Skip if icon already exists
      if (link.querySelector(".file-icon")) return

      // Get the data-href attribute
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

  /**
   * Debounce utility to prevent excessive updates
   */
  private debouncedUpdate(
    key: string,
    updateFn: () => void,
    delay: number = 100
  ): void {
    const existingTimer = this.debounceTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      updateFn()
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }
}
