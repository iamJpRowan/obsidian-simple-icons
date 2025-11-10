/**
 * main.ts
 *
 * This file is the main entry point for the Simple Icons Obsidian plugin.
 * It initializes the plugin, sets up all rendering components, and handles
 * the plugin lifecycle (load, unload, settings persistence).
 *
 * The plugin extends Obsidian's Plugin class and manages three main components:
 * 1. IconResolver - determines which icon to display for each file
 * 2. IconRenderer - renders icons in various locations throughout Obsidian
 * 3. SettingsTab - provides the settings UI for configuring the plugin
 */

import { Plugin, TFile } from "obsidian"
import { createEditorExtension, triggerIconRefresh } from "./EditorExtension"
import { IconRenderer } from "./IconRenderer"
import { IconResolver } from "./IconResolver"
import { SimpleIconsSettingTab } from "./SettingsTab"
import { TagMappingModal } from "./TagMappingModal"
import { DEFAULT_SETTINGS, PluginSettings } from "./types"

/**
 * Main plugin class for Simple Icons
 *
 * This plugin displays custom icons next to files throughout Obsidian based on
 * frontmatter, tags, or folder associations. Icons are rendered in wikilinks,
 * file lists, file views (tabs), suggestions, and metadata panels.
 */
export default class SimpleIconsPlugin extends Plugin {
  settings: PluginSettings
  iconResolver: IconResolver
  iconRenderer: IconRenderer

  /**
   * Initializes the plugin and sets up all rendering components
   *
   * This method is called when the plugin is loaded. It:
   * 1. Loads saved settings or uses defaults
   * 2. Initializes the IconResolver and IconRenderer
   * 3. Registers markdown post processor for reading mode
   * 4. Registers editor extension for live preview mode
   * 5. Sets up event listeners for file changes
   * 6. Adds the settings tab to Obsidian's settings
   */
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
    this.addSettingTab(new SimpleIconsSettingTab(this.app, this))

    // Add command palette command
    this.addCommand({
      id: "manage-tag-mappings",
      name: "Simple Icons: Manage Tag Mappings",
      callback: () => {
        const modal = new TagMappingModal(this.app, this)
        modal.open()
      },
    })
  }

  /**
   * Cleans up the plugin when it is unloaded
   *
   * Disconnects all observers and listeners to prevent memory leaks.
   */
  onunload() {
    this.iconRenderer.onunload()
  }

  /**
   * Loads settings from Obsidian's data storage
   *
   * Merges saved settings with the default settings, ensuring all required
   * properties are present even if settings are missing or incomplete.
   */
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  /**
   * Saves settings to Obsidian's data storage
   *
   * Persists the current settings so they are restored when Obsidian restarts.
   */
  async saveSettings() {
    await this.saveData(this.settings)
  }

  /**
   * Reloads all renderers after settings change
   *
   * Destroys the existing IconRenderer and creates a new one with updated
   * settings. This ensures all rendering components are using the latest
   * configuration. Called when the user changes settings that affect
   * rendering behavior.
   */
  reloadRenderer() {
    this.iconRenderer.onunload()
    this.iconRenderer = new IconRenderer(
      this.app,
      this.iconResolver,
      this.settings
    )
    this.iconRenderer.initializeRendering()
  }
}
