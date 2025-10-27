import { App, TFile } from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { ObserverManager } from "../ObserverManager"
import { PluginSettings } from "../types"

export class FileListRenderer {
  private app: App
  private iconResolver: IconResolver
  private settings: PluginSettings
  private observers: ObserverManager
  private observerInstance: MutationObserver | null = null

  constructor(
    app: App,
    iconResolver: IconResolver,
    settings: PluginSettings,
    observers: ObserverManager
  ) {
    this.app = app
    this.iconResolver = iconResolver
    this.settings = settings
    this.observers = observers
  }

  updateSettings(settings: PluginSettings): void {
    this.settings = settings
  }

  /**
   * Initialize file list rendering with mutation observer
   */
  initialize(): void {
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
  updateFileExplorerIcons(): void {
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
   * Update icon for a specific file in file lists
   */
  updateSingleFileIcon(file: TFile): void {
    if (!this.settings.renderInFileLists) return

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
      const iconEl = IconElementFactory.createIconElement(iconName)
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
      const iconEl = IconElementFactory.createIconElement(iconName)
      result.prepend(iconEl)
    }
  }

  /**
   * Setup mutation observer for file explorer
   */
  private setupFileExplorerObserver(): void {
    const fileExplorer = document.querySelector(".nav-files-container")
    if (!fileExplorer) {
      // Retry after a delay if container not ready
      setTimeout(() => this.setupFileExplorerObserver(), 500)
      return
    }

    const observer = new MutationObserver(() => {
      this.observers.debounce("fileexplorer", () => {
        this.updateFileExplorerIcons()
      })
    })

    // Only observe the file explorer container, not document.body
    observer.observe(fileExplorer, {
      childList: true,
      subtree: true,
    })

    this.observers.add(observer)
    this.observerInstance = observer
  }
}
