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
   * Initialize all rendering hooks
   */
  initializeRendering(): void {
    this.fileViewRenderer.initialize(this.app)
    this.fileListRenderer.initialize()
    this.suggestionRenderer.initialize()
    this.metadataRenderer.initialize()
  }

  /**
   * Clean up all observers and listeners
   */
  onunload(): void {
    this.observers.cleanup()
  }

  /**
   * Render icon for wikilink (used in markdown post processor)
   */
  renderWikilinkIcon(el: HTMLElement, ctx: MarkdownPostProcessorContext): void {
    this.wikilinkRenderer.renderWikilinkIcon(el, ctx)
  }

  /**
   * Update all locations for a specific file
   */
  updateSingleFileIcon(file: TFile): void {
    this.fileListRenderer.updateSingleFileIcon(file)
    this.fileViewRenderer.updateSingleFileIcon(file)
    this.wikilinkRenderer.updateWikilinksForFile(file)
  }
}
