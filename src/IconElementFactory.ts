import { setIcon } from "obsidian"

export class IconElementFactory {
  /**
   * Create icon element for a file
   */
  static createIconElement(iconName: string): HTMLElement {
    const iconEl = document.createElement("span")
    iconEl.addClass("file-icon")
    setIcon(iconEl, iconName)
    return iconEl
  }
}
