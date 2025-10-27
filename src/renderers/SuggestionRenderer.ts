/**
 * SuggestionRenderer.ts
 *
 * This file provides icon rendering for suggestion popups in Obsidian.
 * Suggestion popups appear when autocompleting various inputs like wikilinks,
 * tags, and other metadata. Icons are added to the suggestion items to
 * help users identify the files they're linking to.
 *
 * The renderer uses a MutationObserver to detect when suggestion popups appear
 * and automatically applies icons to the suggestion items.
 */

import { App, TFile } from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { ObserverManager } from "../ObserverManager"
import { PluginSettings } from "../types"

/**
 * Renders icons in suggestion popups
 *
 * This renderer watches for suggestion containers to appear in the DOM and
 * automatically adds icons to suggestion items. It filters mutations to only
 * respond to suggestion-related changes, skipping file explorer, search, and
 * metadata changes for better performance.
 */
export class SuggestionRenderer {
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
   * Initializes suggestion rendering with a mutation observer
   *
   * Sets up an observer to watch for suggestion containers appearing in the
   * DOM. When suggestions are displayed, icons are automatically applied to
   * each suggestion item. The observer filters mutations to only process
   * suggestion-related changes, excluding file explorer, search, and metadata.
   */
  initialize(): void {
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
        this.observers.debounce("suggestions", () => {
          this.updateSuggestionIcons()
        })
      }
    })

    // Observe document.body for suggestion popups (unavoidable - they appear dynamically)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    this.observers.add(observer)
    this.observerInstance = observer
  }

  /**
   * Updates icons for all visible suggestion items
   *
   * Queries the DOM for all suggestion items and adds icons based on the
   * file path associated with each suggestion. The file path is extracted
   * from various sources (data-path attribute, auxiliary text, or title text).
   * Skips items that already have icons to avoid duplicates.
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
      const iconEl = IconElementFactory.createIconElement(iconName)
      titleEl.prepend(iconEl)
    })
  }
}
