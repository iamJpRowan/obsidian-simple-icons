import {
  App,
  MarkdownPostProcessorContext,
  MarkdownView,
  TFile,
} from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { PluginSettings } from "../types"

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
   * Update all wikilinks that reference a specific file across all open views
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
