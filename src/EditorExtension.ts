import { RangeSetBuilder, StateEffect, StateField } from "@codemirror/state"
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view"
import { App, editorLivePreviewField, editorViewField, setIcon } from "obsidian"
import { IconResolver } from "./IconResolver"

// @ts-ignore - syntaxTree is available via Obsidian's CodeMirror
import { syntaxTree } from "@codemirror/language"

/**
 * EditorExtension.ts
 *
 * This file provides a CodeMirror extension for Obsidian that displays file icons
 * next to wikilinks in live preview mode. The extension:
 *
 * 1. Scans the editor's syntax tree for internal links (wikilinks)
 * 2. Resolves each link to its target file
 * 3. Gets the appropriate icon for the target file using IconResolver
 * 4. Displays the icon as a widget decoration next to the link
 *
 * The extension only operates in live preview mode and automatically refreshes
 * when the document changes, viewport changes, or when manually triggered.
 */

// State effect to trigger icon refresh across all editor instances
const refreshIconsEffect = StateEffect.define<void>()

/**
 * IconWidget - A CodeMirror widget that renders a file icon
 *
 * This widget creates a DOM element containing an Obsidian icon that can be
 * inserted into the editor as a decoration. The icon is positioned next to
 * wikilinks to indicate the type of file being linked to.
 */
class IconWidget extends WidgetType {
  constructor(private iconName: string) {
    super()
  }

  /**
   * Creates the DOM element for the icon widget
   * @returns HTMLElement containing the rendered icon
   */
  toDOM(): HTMLElement {
    const span = document.createElement("span")
    span.addClass("file-icon")
    setIcon(span, this.iconName) // Use Obsidian's setIcon utility
    return span
  }
}

/**
 * Creates the main CodeMirror editor extension for displaying file icons
 *
 * This function returns a ViewPlugin that:
 * - Tracks when icons need to be refreshed using a state field
 * - Builds decorations (icon widgets) for wikilinks in live preview mode
 * - Updates decorations when the document or viewport changes
 *
 * @param app - The Obsidian App instance for accessing metadata and files
 * @param iconResolver - Service for determining which icon to use for each file
 * @returns ViewPlugin that can be added to a CodeMirror editor
 */
export function createEditorExtension(app: App, iconResolver: IconResolver) {
  // State field to track refresh state - increments when icons need updating
  const iconRefreshState = StateField.define<number>({
    create() {
      return 0
    },
    update(value, tr) {
      // Increment refresh counter when refreshIconsEffect is present
      if (tr.effects.some(e => e.is(refreshIconsEffect))) {
        return value + 1
      }
      return value
    },
  })

  return ViewPlugin.fromClass(
    /**
     * Main plugin class that manages icon decorations in the editor
     */
    class {
      decorations: DecorationSet
      previousRefreshState = 0

      /**
       * Initialize the plugin with initial decorations
       * @param view - The CodeMirror EditorView instance
       */
      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view)
        this.previousRefreshState = view.state.field(iconRefreshState)
      }

      /**
       * Handle updates to the editor view
       * Rebuilds decorations when:
       * - Document content changes
       * - Viewport (visible area) changes
       * - Manual refresh is triggered
       *
       * @param update - ViewUpdate containing information about what changed
       */
      update(update: ViewUpdate) {
        const newRefreshState = update.view.state.field(iconRefreshState)
        const hasMetadataChange = newRefreshState !== this.previousRefreshState
        this.previousRefreshState = newRefreshState

        if (update.docChanged || update.viewportChanged || hasMetadataChange) {
          this.decorations = this.buildDecorations(update.view)
        }
      }

      /**
       * Builds the decoration set containing icon widgets for wikilinks
       *
       * This method:
       * 1. Checks if we're in live preview mode (icons only show in live preview)
       * 2. Gets the current file for link resolution context
       * 3. Iterates through the visible syntax tree nodes
       * 4. Finds internal links (wikilinks) and resolves their target files
       * 5. Creates icon widgets for resolved files and positions them next to links
       *
       * @param view - The CodeMirror EditorView to build decorations for
       * @returns DecorationSet containing all icon widgets to display
       */
      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>()

        // Check if we're in live preview mode - icons only show in live preview
        const isLivePreview = view.state.field(editorLivePreviewField)
        if (!isLivePreview) {
          return builder.finish()
        }

        // Get the current file for link resolution context
        const file = view.state.field(editorViewField)?.file
        if (!file) {
          return builder.finish()
        }

        // Iterate through visible ranges in the editor
        for (const { from, to } of view.visibleRanges) {
          syntaxTree(view.state).iterate({
            from,
            to,
            enter: (node: any) => {
              // Look for internal links (wikilinks) in all formatting contexts
              // Links can appear as: "hmd-internal-link", "hmd-internal-link_strong",
              // "header_header-2_hmd-internal-link", "hmd-internal-link_list-1", etc.
              if (
                node.name &&
                (node.name === "hmd-internal-link" ||
                  node.name.startsWith("hmd-internal-link_") ||
                  node.name.endsWith("_hmd-internal-link") ||
                  node.name.includes("_hmd-internal-link_"))
              ) {
                const linkText = view.state.doc.sliceString(node.from, node.to)

                // Parse link text - may contain | for alias (e.g., "file|display text")
                let linkPath = linkText
                if (linkText.includes("|")) {
                  linkPath = linkText.split("|")[0]
                }

                // Resolve the linked file using Obsidian's metadata cache
                const linkedFile = app.metadataCache.getFirstLinkpathDest(
                  linkPath,
                  file.path
                )

                if (linkedFile) {
                  // Get the appropriate icon for this file type
                  const iconName = iconResolver.getIconForFile(linkedFile)

                  if (iconName) {
                    // Position the icon before the link text
                    const iconPos = node.from
                    const widget = Decoration.widget({
                      widget: new IconWidget(iconName),
                      side: -1, // Place before the link text
                    })

                    builder.add(iconPos, iconPos, widget)
                  }
                }
              }
            },
          })
        }

        return builder.finish()
      }
    },
    {
      decorations: v => v.decorations, // Tell CodeMirror to use our decorations
      provide: () => [iconRefreshState], // Provide the refresh state field
    }
  )
}

/**
 * Triggers a refresh of icons in all open markdown editor views
 *
 * This function:
 * 1. Gets all open markdown editor leaves in the workspace
 * 2. Accesses the CodeMirror instance for each editor
 * 3. Dispatches the refreshIconsEffect to trigger decoration rebuilding
 *
 * This is useful when icon mappings change or when you want to force
 * a refresh of all visible icons across the application.
 *
 * @param app - The Obsidian App instance for accessing workspace
 */
export function triggerIconRefresh(app: App): void {
  // Get all editor views and dispatch the refresh effect
  const leaves = app.workspace.getLeavesOfType("markdown")
  leaves.forEach(leaf => {
    const view = leaf.view
    // Access the editor view through the internal implementation
    if (view && (view as any).editor && (view as any).editor.cm) {
      const editorView = (view as any).editor.cm
      if (editorView && editorView.dispatch) {
        const state = editorView.state
        if (state) {
          editorView.dispatch({
            effects: refreshIconsEffect.of(),
          })
        }
      }
    }
  })
}
