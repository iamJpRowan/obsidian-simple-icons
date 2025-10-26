import { RangeSetBuilder } from "@codemirror/state"
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

class IconWidget extends WidgetType {
  constructor(private iconName: string) {
    super()
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span")
    span.addClass("file-icon")
    span.style.marginRight = "4px"
    span.style.display = "inline-flex"
    span.style.alignItems = "center"
    setIcon(span, this.iconName)
    return span
  }
}

export function createEditorExtension(app: App, iconResolver: IconResolver) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view)
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
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
              if (
                node.name.includes("hmd-internal-link") ||
                node.name === "link" ||
                node.name === "internal-link"
              ) {
                const linkText = view.state.doc.sliceString(node.from, node.to)
                const match = linkText.match(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/)

                if (match) {
                  const linkPath = match[1]

                  // Resolve the linked file
                  const linkedFile = app.metadataCache.getFirstLinkpathDest(
                    linkPath,
                    file.path
                  )

                  if (linkedFile) {
                    const iconName = iconResolver.getIconForFile(linkedFile)
                    if (iconName) {
                      // Position the icon right after the opening [[
                      const iconPos = node.from + 2
                      const widget = Decoration.widget({
                        widget: new IconWidget(iconName),
                        side: 1,
                      })
                      builder.add(iconPos, iconPos, widget)
                    }
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
    }
  )
}
