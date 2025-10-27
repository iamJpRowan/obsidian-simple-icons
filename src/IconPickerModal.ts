/**
 * IconPickerModal.ts
 *
 * This file provides a fuzzy suggestion modal for selecting Lucide icons.
 * The modal allows users to search and preview icons before selecting them,
 * making it easy to configure which icons are associated with files, tags, and folders.
 */

import { App, FuzzyMatch, FuzzySuggestModal, setIcon } from "obsidian"
import { IconResolver } from "./IconResolver"

/**
 * Modal dialog for selecting icons from the Lucide icon set
 *
 * This modal extends Obsidian's FuzzySuggestModal to provide a searchable
 * interface for selecting icons. Users can type to search for icons and see
 * visual previews of each icon before making a selection.
 */
export class IconPickerModal extends FuzzySuggestModal<string> {
  private iconResolver: IconResolver
  private onChoose: (iconName: string) => void
  private allIcons: string[]

  /**
   * Creates a new icon picker modal
   *
   * @param app - The Obsidian App instance
   * @param iconResolver - Service for determining which icons are valid
   * @param onChoose - Callback function called when an icon is selected
   */
  constructor(
    app: App,
    iconResolver: IconResolver,
    onChoose: (iconName: string) => void
  ) {
    super(app)
    this.iconResolver = iconResolver
    this.onChoose = onChoose
    this.allIcons = iconResolver.getValidIconNames()
    this.setPlaceholder("Search for a Lucide icon...")
  }

  /**
   * Returns the list of all available icon names
   *
   * @returns Array of icon name strings to display in the modal
   */
  getItems(): string[] {
    return this.allIcons
  }

  /**
   * Returns the display text for an icon in the suggestion list
   *
   * @param iconName - The name of the icon
   * @returns The display text for the icon
   */
  getItemText(iconName: string): string {
    return iconName
  }

  /**
   * Handles the selection of an icon from the modal
   *
   * When a user selects an icon from the suggestion list, this method
   * is called and invokes the onChoose callback with the selected icon name.
   *
   * @param iconName - The name of the selected icon
   */
  onChooseItem(iconName: string): void {
    this.onChoose(iconName)
  }

  /**
   * Renders a single icon suggestion in the modal list
   *
   * This method creates the DOM structure for displaying each icon suggestion,
   * including a visual preview of the icon and its name. The suggestion is
   * rendered inside a container with specific CSS classes for styling.
   *
   * @param match - The fuzzy match result from the search
   * @param el - The container element where the suggestion should be rendered
   */
  renderSuggestion(match: FuzzyMatch<string>, el: HTMLElement): void {
    const iconName = match.item
    el.empty()

    const container = el.createDiv({ cls: "icon-picker-suggestion" })

    // Icon preview
    const iconEl = container.createSpan({ cls: "icon-picker-icon" })
    setIcon(iconEl, iconName)

    // Icon name
    container.createSpan({
      text: iconName,
      cls: "icon-picker-name",
    })
  }
}
