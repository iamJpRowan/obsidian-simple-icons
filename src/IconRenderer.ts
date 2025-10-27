/**
 * IconRenderer.ts
 *
 * This file provides the main IconRenderer class that coordinates all icon
 * rendering throughout the Obsidian UI. It acts as a facade that delegates
 * specific rendering tasks to specialized renderer classes for different
 * locations (wikilinks, file views, file lists, suggestions, metadata).
 *
 * The IconRenderer manages the lifecycle of all sub-renderers and provides
 * a unified interface for updating icons across the entire application.
 */

import { App, Component, MarkdownPostProcessorContext, TFile } from "obsidian"
import { IconResolver } from "./IconResolver"
import { ObserverManager } from "./ObserverManager"
import {
  FileListRenderer,
  FileViewRenderer,
  MetadataRenderer,
  SuggestionRenderer,
  WikilinkRenderer,
} from "./renderers"
import { PluginSettings } from "./types"

/**
 * Main renderer coordinator for displaying file icons throughout Obsidian
 *
 * This component manages all icon rendering across different locations in the
 * Obsidian UI. It coordinates specialized renderers for wikilinks, file views,
 * file lists, suggestions, and metadata panels. The IconRenderer handles
 * initialization, settings updates, and cleanup of all sub-renderers.
 */
export class IconRenderer extends Component {
  private app: App
  private iconResolver: IconResolver
  private settings: PluginSettings
  private observers: ObserverManager

  // Renderer instances
  private wikilinkRenderer: WikilinkRenderer
  private fileViewRenderer: FileViewRenderer
  private fileListRenderer: FileListRenderer
  private suggestionRenderer: SuggestionRenderer
  private metadataRenderer: MetadataRenderer

  /**
   * Creates a new IconRenderer instance
   *
   * Initializes all sub-renderers with the provided dependencies. Each renderer
   * is responsible for a specific location in the Obsidian UI where icons can be displayed.
   *
   * @param app - The Obsidian App instance
   * @param iconResolver - Service for determining which icon to display for files
   * @param settings - Current plugin settings
   */
  constructor(app: App, iconResolver: IconResolver, settings: PluginSettings) {
    super()
    this.app = app
    this.iconResolver = iconResolver
    this.settings = settings
    this.observers = new ObserverManager()

    // Initialize all renderers
    this.wikilinkRenderer = new WikilinkRenderer(app, iconResolver, settings)
    this.fileViewRenderer = new FileViewRenderer(app, iconResolver, settings)
    this.fileListRenderer = new FileListRenderer(
      app,
      iconResolver,
      settings,
      this.observers
    )
    this.suggestionRenderer = new SuggestionRenderer(
      app,
      iconResolver,
      settings,
      this.observers
    )
    this.metadataRenderer = new MetadataRenderer(
      app,
      iconResolver,
      settings,
      this.observers
    )
  }

  /**
   * Updates settings for all sub-renderers
   *
   * Propagates setting changes to all renderers so they can adjust their
   * behavior accordingly. This is called when the user changes settings in
   * the settings tab.
   *
   * @param settings - The new settings to apply
   */
  updateSettings(settings: PluginSettings): void {
    this.settings = settings

    // Update settings for all renderers
    this.wikilinkRenderer.updateSettings(settings)
    this.fileViewRenderer.updateSettings(settings)
    this.fileListRenderer.updateSettings(settings)
    this.suggestionRenderer.updateSettings(settings)
    this.metadataRenderer.updateSettings(settings)
  }

  /**
   * Initializes all rendering hooks across the Obsidian UI
   *
   * Sets up the necessary event listeners and mutation observers for each
   * renderer type. This is called after the plugin loads to start displaying
   * icons in all configured locations.
   */
  initializeRendering(): void {
    this.fileViewRenderer.initialize(this.app)
    this.fileListRenderer.initialize()
    this.suggestionRenderer.initialize()
    this.metadataRenderer.initialize()
  }

  /**
   * Cleans up all observers and listeners
   *
   * Disconnects all MutationObserver instances and clears debounce timers.
   * This is called when the plugin unloads to prevent memory leaks and
   * ensure proper cleanup.
   */
  onunload(): void {
    this.observers.cleanup()
  }

  /**
   * Renders icons for wikilinks in a markdown element
   *
   * This method is called by Obsidian's markdown post processor to add
   * icons to wikilinks in reading mode. It delegates to the WikilinkRenderer
   * to handle the actual rendering logic.
   *
   * @param el - The HTML element containing wikilinks to render
   * @param ctx - The post processor context with source path information
   */
  renderWikilinkIcon(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    this.wikilinkRenderer.renderWikilinkIcon(el, ctx)
  }

  /**
   * Updates icons for a specific file across all rendering locations
   *
   * When a file's metadata changes or is updated, this method refreshes all
   * visible icons for that file in the file list, file view, and wikilinks.
   * This ensures the UI stays in sync with file changes.
   *
   * @param file - The file whose icons should be updated
   */
  updateSingleFileIcon(file: TFile): void {
    this.fileListRenderer.updateSingleFileIcon(file)
    this.fileViewRenderer.updateSingleFileIcon(file)
    this.wikilinkRenderer.updateWikilinksForFile(file)
  }
}
