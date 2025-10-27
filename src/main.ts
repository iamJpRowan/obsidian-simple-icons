import { Plugin, TFile } from "obsidian"
import { createEditorExtension, triggerIconRefresh } from "./EditorExtension"
import { IconRenderer } from "./IconRenderer"
import { IconResolver } from "./IconResolver"
import { LucideIconsSettingTab } from "./SettingsTab"
import { DEFAULT_SETTINGS, PluginSettings } from "./types"

export default class LucideIconsPlugin extends Plugin {
  settings: PluginSettings
  iconResolver: IconResolver
  iconRenderer: IconRenderer

  async onload() {
    await this.loadSettings()

    // Initialize core components
    this.iconResolver = new IconResolver(this.app, this.settings)
    this.iconRenderer = new IconRenderer(
      this.app,
      this.iconResolver,
      this.settings
    )

    // Register markdown post processor for wikilinks in reading mode
    this.registerMarkdownPostProcessor((el, ctx) => {
      this.iconRenderer.renderWikilinkIcon(el, ctx)
    })

    // Register editor extension for live preview mode
    this.registerEditorExtension(
      createEditorExtension(this.app, this.iconResolver)
    )

    // Initialize rendering
    this.iconRenderer.initializeRendering()

    // Register event listeners for cache invalidation and targeted updates
    this.registerEvent(
      this.app.metadataCache.on("changed", file => {
        // Invalidate cache for the changed file
        this.iconResolver.invalidateFile(file)
        // Update only this specific file in the UI
        if (file instanceof TFile) {
          this.iconRenderer.updateSingleFileIcon(file)
          // Trigger editor view updates for live preview wikilinks
          triggerIconRefresh(this.app)
        }
      })
    )

    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        if (file instanceof TFile) {
          // Invalidate cache for renamed file
          this.iconResolver.invalidateFile(file)
          // Update the file in UI
          this.iconRenderer.updateSingleFileIcon(file)
        }
      })
    )

    this.registerEvent(
      this.app.vault.on("delete", file => {
        if (file instanceof TFile) {
          // Invalidate cache for deleted file
          this.iconResolver.invalidateFile(file)
          // No need to update UI - file is deleted
        }
      })
    )

    this.registerEvent(
      this.app.vault.on("create", file => {
        if (file instanceof TFile) {
          // New files will be picked up by the MutationObserver
          // Just invalidate to ensure fresh lookup
          this.iconResolver.invalidateFile(file)
        }
      })
    )

    // Add settings tab
    this.addSettingTab(new LucideIconsSettingTab(this.app, this))
  }

  onunload() {
    this.iconRenderer.unload()
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }

  /**
   * Reload renderer after settings change
   */
  reloadRenderer() {
    this.iconRenderer.unload()
    this.iconRenderer = new IconRenderer(
      this.app,
      this.iconResolver,
      this.settings
    )
    this.iconRenderer.initializeRendering()
  }
}
