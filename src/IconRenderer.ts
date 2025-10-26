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
    iconEl.style.marginRight = "4px"
    iconEl.style.display = "inline-flex"
    iconEl.style.alignItems = "center"
    setIcon(iconEl, iconName)
    return iconEl
  }

  /**
   * Render icon for wikilink (used in markdown post processor)
   */
  renderWikilinkIcon(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    if (!this.settings.renderInWikilinks) return

    // Find all internal links in the element
    const links = el.querySelectorAll("a.internal-link")
    links.forEach(link => {
      const href = link.getAttribute("href")
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

    // Update all view headers (tabs)
    const viewHeaders = document.querySelectorAll(".view-header-title")
    viewHeaders.forEach(header => {
      this.updateViewHeaderIcon(header as HTMLElement)
    })

    // Update inline titles in editor
    const inlineTitles = document.querySelectorAll(".inline-title")
    inlineTitles.forEach(title => {
      this.updateInlineTitleIcon(title as HTMLElement)
    })
  }

  /**
   * Update icon in view header (tab)
   */
  private updateViewHeaderIcon(header: HTMLElement): void {
    const leaf = this.app.workspace.activeLeaf
    if (!leaf || !(leaf.view instanceof MarkdownView)) return

    const file = leaf.view.file
    if (!file) return

    const iconName = this.iconResolver.getIconForFile(file)

    // Remove existing icon
    const existingIcon = header.querySelector(".file-icon")
    if (existingIcon) {
      existingIcon.remove()
    }

    if (iconName) {
      const iconEl = this.createIconElement(iconName)
      header.prepend(iconEl)
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

    // Set up mutation observer for suggestion containers
    const observer = new MutationObserver(() => {
      this.updateSuggestionIcons()
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

      const filePath = suggestion.getAttribute("data-path")
      if (!filePath) return

      const file = this.app.vault.getAbstractFileByPath(filePath)
      if (!(file instanceof TFile)) return

      const iconName = this.iconResolver.getIconForFile(file)

      // Remove existing icon
      const existingIcon = titleEl.querySelector(".file-icon")
      if (existingIcon) {
        existingIcon.remove()
      }

      if (iconName) {
        const iconEl = this.createIconElement(iconName)
        titleEl.prepend(iconEl)
      }
    })
  }
}
