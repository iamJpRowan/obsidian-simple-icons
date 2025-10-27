/**
 * WikilinkRenderer.ts
 *
 * This file provides icon rendering for wikilinks in Obsidian markdown.
 * Wikilinks are the [[...]] syntax used to link between notes in Obsidian.
 * Icons are displayed next to these links in both reading mode and live preview.
 *
 * The renderer supports both the markdown post processor (reading mode) and
 * can also update individual wikilinks when file metadata changes.
 */

import {
  App,
  MarkdownPostProcessorContext,
  MarkdownView,
  TFile,
} from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { PluginSettings } from "../types"

/**
 * Renders icons next to wikilinks in markdown
 *
 * This renderer handles wikilink icon rendering in both reading mode (via
 * markdown post processor) and live preview mode (via editor extension).
 * It resolves the target file for each wikilink and displays the appropriate
 * icon based on plugin settings.
 */
export class WikilinkRenderer {
  private app: App
  private iconResolver: IconResolver
  private settings: PluginSettings

  constructor(app: App, iconResolver: IconResolver, settings: PluginSettings) {
    this.app = app
    this.iconResolver = iconResolver
    this.settings = settings
  }

  updateSettings(settings: PluginSettings): void {
    this.settings = settings
  }

  /**
   * Renders icons for wikilinks in a markdown element (reading mode)
   *
   * This method is called by Obsidian's markdown post processor for each
   * markdown element that might contain wikilinks. It finds all internal links
   * and adds icons based on the resolved target file. Special handling for
   * multi-select pills (tag-like metadata elements).
   *
   * @param el - The HTML element containing wikilinks
   * @param ctx - The post processor context with source path information
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

      // Create icon element
      const iconEl = IconElementFactory.createIconElement(iconName)

      // For multi-select pills, prepend to content container
      if (
        link instanceof HTMLElement &&
        link.classList.contains("multi-select-pill")
      ) {
        const contentEl = link.querySelector(".multi-select-pill-content")
        if (contentEl) {
          contentEl.prepend(iconEl)
        } else {
          link.prepend(iconEl)
        }
      } else {
        link.prepend(iconEl)
      }
    })
  }

  /**
   * Updates all wikilinks that reference a specific file across all open views
   *
   * When a file's metadata changes, this method finds all wikilinks pointing
   * to that file in all open markdown views and updates their icons. This
   * ensures the UI stays in sync when file metadata changes.
   *
   * @param targetFile - The file whose icon should be updated in wikilinks
   */
  updateWikilinksForFile(targetFile: TFile): void {
    if (!this.settings.renderInWikilinks) return

    // Update wikilinks in all markdown views
    const leaves = this.app.workspace.getLeavesOfType("markdown")
    leaves.forEach(leaf => {
      const view = leaf.view
      if (!(view instanceof MarkdownView)) return
      if (!view.file) return

      const file = view.file
      const contentEl = view.contentEl || view.containerEl
      if (!contentEl) return

      // Find all wikilinks in this view
      const links = contentEl.querySelectorAll(
        "a.internal-link, div.internal-link"
      )
      links.forEach(link => {
        const href = link.getAttribute("href") || link.getAttribute("data-href")
        if (!href) return

        // Resolve the linked file
        const linkedFile = this.app.metadataCache.getFirstLinkpathDest(
          href,
          file.path
        )

        // If this link points to our target file, update the icon
        if (linkedFile && linkedFile.path === targetFile.path) {
          const iconName = this.iconResolver.getIconForFile(targetFile)

          // Remove existing icon
          const existingIcon = link.querySelector(".file-icon")
          if (existingIcon) {
            existingIcon.remove()
          }

          if (iconName) {
            const iconEl = IconElementFactory.createIconElement(iconName)

            // For multi-select pills, prepend to content container
            if (link.classList.contains("multi-select-pill")) {
              const contentEl = link.querySelector(".multi-select-pill-content")
              if (contentEl) {
                contentEl.prepend(iconEl)
              } else {
                link.prepend(iconEl)
              }
            } else {
              link.prepend(iconEl)
            }
          }
        }
      })
    })
  }
}
