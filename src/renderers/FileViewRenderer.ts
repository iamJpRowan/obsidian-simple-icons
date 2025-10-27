import { App, MarkdownView, TFile } from "obsidian"
import { IconElementFactory } from "../IconElementFactory"
import { IconResolver } from "../IconResolver"
import { PluginSettings } from "../types"

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
   * Register file view rendering (tabs and inline titles)
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
   * Update icons in file views (tabs and titles)
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
   * Update icon for a specific file in file views
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
      const iconEl = IconElementFactory.createIconElement(iconName)
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
      const iconEl = IconElementFactory.createIconElement(iconName)
      title.prepend(iconEl)
    }
  }
}
