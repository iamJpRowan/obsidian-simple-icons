/**
 * FileViewRenderer.ts
 *
 * This file provides icon rendering for file views in Obsidian, including:
 * - Tab headers (workspace tabs)
 * - Inline titles (file titles in the editor view)
 *
 * The renderer listens to workspace events (active-leaf-change, layout-change)
 * and updates icons when files are opened or switched to.
 */

import { App, MarkdownView, TFile } from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { PluginSettings } from "../types"

/**
 * Renders icons in file views (tabs and inline titles)
 *
 * This renderer listens for workspace events and updates icons in tab headers
 * and inline titles when files are opened or the active leaf changes. It uses
 * workspace events rather than mutation observers for better performance.
 */
export class FileViewRenderer {
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
   * Initializes file view rendering with workspace event listeners
   *
   * Registers listeners for active-leaf-change and layout-change events to
   * automatically update icons when files are opened, closed, or switched.
   * Also performs an initial render to add icons to currently visible files.
   */
  initialize(app: App): void {
    if (!this.settings.renderInFileView) return

    // Use workspace event to detect when files are opened or changed
    app.workspace.on("active-leaf-change", () => {
      setTimeout(() => this.updateFileViewIcons(), 100)
    })

    app.workspace.on("layout-change", () => {
      setTimeout(() => this.updateFileViewIcons(), 100)
    })

    // Single initial render
    setTimeout(() => this.updateFileViewIcons(), 200)
  }

  /**
   * Updates icons for all visible file views
   *
   * Iterates through all open markdown tabs and updates their header icons.
   * Also updates inline titles in the active editor view. This is called
   * when workspace events fire or when manually refreshing.
   */
  updateFileViewIcons(): void {
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
   * Updates the icon for a specific file in file views
   *
   * Locates the tab header and inline title for the given file and updates
   * their icons. This is more efficient than refreshing all files when only
   * one file has changed.
   *
   * @param file - The file whose icon should be updated
   */
  updateSingleFileIcon(file: TFile): void {
    if (!this.settings.renderInFileView) return

    // Update tab header for this file
    const leaves = this.app.workspace.getLeavesOfType("markdown")
    for (const leaf of leaves) {
      if (leaf.view instanceof MarkdownView && leaf.view.file) {
        if (leaf.view.file.path === file.path) {
          this.updateTabHeaderForLeaf(leaf)
          break
        }
      }
    }

    // Update inline title for this file
    const activeLeaf = this.app.workspace.activeLeaf
    if (activeLeaf?.view instanceof MarkdownView && activeLeaf.view.file) {
      if (activeLeaf.view.file.path === file.path) {
        const inlineTitles = document.querySelectorAll(".inline-title")
        inlineTitles.forEach(title => {
          this.updateInlineTitleIcon(title as HTMLElement)
        })
      }
    }
  }

  /**
   * Updates the icon in a workspace tab header
   *
   * Finds the tab header element by matching the file's basename to the tab
   * title text, then updates or adds the icon element.
   *
   * @param leaf - The workspace leaf (view) to update
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
      const iconEl = IconElementFactory.createIconElement(iconName)
      viewHeader.prepend(iconEl)
    }
  }

  /**
   * Updates the icon in an inline title
   *
   * Updates the icon for the current file's inline title in the editor view.
   * The title element is already provided from the DOM query.
   *
   * @param title - The inline title element to update
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
      const iconEl = IconElementFactory.createIconElement(iconName)
      title.prepend(iconEl)
    }
  }
}
