/**
 * IconElementFactory.ts
 *
 * This file provides a utility class for creating icon DOM elements.
 * It encapsulates the logic for creating standardized icon elements that can be
 * used throughout the plugin to display file icons in various locations.
 */

import { setIcon } from "obsidian"

/**
 * Utility class for creating icon DOM elements
 *
 * This factory class provides a consistent way to create icon elements
 * that can be inserted into the Obsidian UI. All icon elements created
 * through this factory share the same CSS class for consistent styling.
 */
export class IconElementFactory {
  /**
   * Creates a standardized icon element for a file
   *
   * This method creates a span element with the 'file-icon' class and uses
   * Obsidian's setIcon utility to render the specified icon. The icon name
   * should be a valid Lucide icon name that will be displayed in the UI.
   *
   * @param iconName - The name of the icon to display (e.g., 'file-text', 'folder', 'home')
   * @returns A span element containing the rendered icon with the 'file-icon' class
   */
  static createIconElement(iconName: string): HTMLElement {
    const iconEl = document.createElement("span")
    iconEl.addClass("file-icon")
    setIcon(iconEl, iconName)
    return iconEl
  }
}
