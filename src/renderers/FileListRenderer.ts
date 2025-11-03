/**
 * FileListRenderer.ts
 *
 * This file provides icon rendering for file lists in Obsidian, including:
 * - File explorer (left sidebar)
 * - Search results
 *
 * The renderer uses MutationObserver to detect when new files are added to
 * the DOM and automatically applies icons. Updates are debounced to prevent
 * performance issues when many files are displayed.
 */

import { App, TFile } from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { ObserverManager } from "../ObserverManager"
import { PluginSettings } from "../types"

/**
 * Renders icons in file lists (explorer and search results)
 *
 * This renderer watches the file explorer and search results for changes
 * and automatically adds icons to file list items. It uses a MutationObserver
 * to detect when files are added or renamed, and debounces updates to ensure
 * smooth performance with large file lists.
 */
export class FileListRenderer {
  private app: App
  private iconResolver: IconResolver
  private settings: PluginSettings
  private observers: ObserverManager
  private observerInstance: MutationObserver | null = null

  /**
   * Creates a new FileListRenderer instance
   *
   * @param app - The Obsidian App instance
   * @param iconResolver - Service for determining which icon to display
   * @param settings - Current plugin settings
   * @param observers - Manager for mutation observers
   */
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

  /**
   * Updates settings for this renderer
   *
   * @param settings - The new settings to apply
   */
  updateSettings(settings: PluginSettings): void {
    this.settings = settings
  }

  /**
   * Initializes file list rendering with a mutation observer
   *
   * Sets up an observer to watch the file explorer container for changes.
   * When files are added, renamed, or reorganized, icons are automatically
   * updated. The observer is debounced to prevent excessive updates.
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
   * Updates icons for all visible files in the file explorer and search results
   *
   * Iterates through all file list items currently visible in the DOM and
   * adds icons based on the current settings. This is called initially after
   * setup and whenever the mutation observer detects changes.
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
   * Updates the icon for a specific file in file lists
   *
   * Finds all file list items with the given file path and updates their
   * icons. This is more efficient than refreshing all files when only one
   * file has changed (e.g., after metadata update).
   *
   * @param file - The file whose icon should be updated
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
   * Updates the icon for a single file in the explorer
   *
   * Extracts the file path from the nav file element, resolves the icon,
   * and prepends the icon element to the file title content.
   *
   * @param navFile - The navigation file element to update
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
   * Updates the icon for a single search result
   *
   * Extracts the file path from the search result element, resolves the icon,
   * and prepends the icon element to the result.
   *
   * @param result - The search result element to update
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
   * Sets up a mutation observer for the file explorer container
   *
   * Creates a new MutationObserver to watch for DOM changes in the file
   * explorer. When changes are detected, icons are updated with debouncing
   * to prevent performance issues. If the container isn't ready yet, retries
   * after a delay.
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
