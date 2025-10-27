/**
 * MetadataRenderer.ts
 *
 * This file provides icon rendering for metadata links in Obsidian, including:
 * - Metadata link divs (file links in properties panel)
 * - Multi-select pills (tag-like elements for metadata fields)
 *
 * The renderer uses a MutationObserver to detect when metadata panels are
 * created or updated. It must observe document.body since metadata panels
 * can appear anywhere in the UI dynamically.
 */

import { App } from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { ObserverManager } from "../ObserverManager"
import { PluginSettings } from "../types"

/**
 * Renders icons in metadata links and multi-select pills
 *
 * This renderer watches for changes to metadata containers and automatically
 * adds icons to file links in properties panels. It filters mutations to only
 * respond to metadata-related changes for better performance.
 */
export class MetadataRenderer {
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
   * Initializes metadata link rendering with a mutation observer
   *
   * Sets up an observer to watch for changes to metadata containers. When
   * metadata links or multi-select pills are added, icons are automatically
   * applied. The observer filters mutations to only process metadata-related
   * changes for performance.
   */
  initialize(): void {
    if (!this.settings.renderInWikilinks) return

    const observer = new MutationObserver(mutations => {
      let hasMetadata = false

      for (const mutation of mutations) {
        if (mutation.target instanceof Element) {
          const target = mutation.target as Element
          if (
            target.closest(".metadata-link-inner") ||
            target.closest(".metadata-container") ||
            target.closest(".multi-select-pill") ||
            target.closest(".multi-select-container") ||
            target.classList?.contains("metadata-link-inner") ||
            target.classList?.contains("metadata-container") ||
            target.classList?.contains("multi-select-pill") ||
            target.classList?.contains("multi-select-container")
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
              node.classList?.contains("multi-select-pill") ||
              node.classList?.contains("multi-select-container") ||
              node.querySelector?.(".metadata-link-inner") ||
              node.querySelector?.(".multi-select-pill")
            ) {
              hasMetadata = true
              break
            }
          }
        }
        if (hasMetadata) break
      }

      if (hasMetadata) {
        this.observers.debounce("metadata", () => {
          this.updateMetadataLinkIcons()
        })
      }
    })

    // Observe document.body for metadata changes (unavoidable - properties panel is dynamic)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    this.observers.add(observer)
    this.observerInstance = observer

    // Initial render
    setTimeout(() => this.updateMetadataLinkIcons(), 200)

    // Also update on active leaf change
    this.app.workspace.on("active-leaf-change", () => {
      setTimeout(() => this.updateMetadataLinkIcons(), 100)
    })
  }

  /**
   * Updates icons for all visible metadata links and multi-select pills
   *
   * Queries the DOM for all metadata link divs and multi-select pills and
   * adds icons based on the linked file. Skips elements that already have
   * icons to avoid duplicates.
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
      const iconEl = IconElementFactory.createIconElement(iconName)
      link.prepend(iconEl)
    })

    // Find all multi-select pills
    const multiSelectPills = document.querySelectorAll(
      "div.multi-select-pill.internal-link"
    )

    multiSelectPills.forEach(pill => {
      // Skip if icon already exists
      if (pill.querySelector(".file-icon")) return

      // Get the data-href attribute
      const href = pill.getAttribute("data-href")
      if (!href) return

      // Resolve the file from the link
      const file = this.app.metadataCache.getFirstLinkpathDest(
        href,
        activeFile.path
      )
      if (!file) return

      const iconName = this.iconResolver.getIconForFile(file)
      if (!iconName) return

      // Find the content container (multi-select-pill-content) and prepend icon there
      const contentEl = pill.querySelector(".multi-select-pill-content")
      if (contentEl) {
        const iconEl = IconElementFactory.createIconElement(iconName)
        contentEl.prepend(iconEl)
      }
    })
  }
}
