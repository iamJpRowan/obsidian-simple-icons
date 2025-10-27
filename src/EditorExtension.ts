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

// State effect to trigger icon refresh
const refreshIconsEffect = StateEffect.define<void>()

class IconWidget extends WidgetType {
  constructor(private iconName: string) {
    super()
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span")
    span.addClass("file-icon")
    setIcon(span, this.iconName)
    return span
  }
}

export function createEditorExtension(app: App, iconResolver: IconResolver) {
  // State field to track refresh state
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
    class {
      decorations: DecorationSet
      previousRefreshState: number = 0

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view)
        this.previousRefreshState = view.state.field(iconRefreshState)
      }

      update(update: ViewUpdate) {
        const newRefreshState = update.view.state.field(iconRefreshState)
        const hasMetadataChange = newRefreshState !== this.previousRefreshState
        this.previousRefreshState = newRefreshState

        if (update.docChanged || update.viewportChanged || hasMetadataChange) {
          this.decorations = this.buildDecorations(update.view)
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>()

        // Check if we're in live preview mode
        const isLivePreview = view.state.field(editorLivePreviewField)
        if (!isLivePreview) {
          return builder.finish()
        }

        // Get the current file
        const file = view.state.field(editorViewField)?.file
        if (!file) {
          return builder.finish()
        }

        // Iterate through syntax tree to find wikilinks
        for (const { from, to } of view.visibleRanges) {
          syntaxTree(view.state).iterate({
            from,
            to,
            enter: (node: any) => {
              // Look for internal links (wikilinks)
              // In live preview, the link text is in the hmd-internal-link node without brackets
              if (node.name === "hmd-internal-link") {
                const linkText = view.state.doc.sliceString(node.from, node.to)

                // Parse link text - may contain | for alias
                let linkPath = linkText
                if (linkText.includes("|")) {
                  linkPath = linkText.split("|")[0]
                }

                // Resolve the linked file
                const linkedFile = app.metadataCache.getFirstLinkpathDest(
                  linkPath,
                  file.path
                )

                if (linkedFile) {
                  const iconName = iconResolver.getIconForFile(linkedFile)

                  if (iconName) {
                    // Position the icon at the start of the link text
                    const iconPos = node.from
                    const widget = Decoration.widget({
                      widget: new IconWidget(iconName),
                      side: 1,
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
      decorations: v => v.decorations,
      provide: () => [iconRefreshState],
    }
  )
}

// Helper function to trigger icon refresh in all editor views
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
