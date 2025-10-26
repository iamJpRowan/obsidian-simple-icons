import { App, FuzzyMatch, FuzzySuggestModal, setIcon } from "obsidian"
import { IconResolver } from "./IconResolver"

export class IconPickerModal extends FuzzySuggestModal<string> {
  private iconResolver: IconResolver
  private onChoose: (iconName: string) => void
  private allIcons: string[]

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

  getItems(): string[] {
    return this.allIcons
  }

  getItemText(iconName: string): string {
    return iconName
  }

  onChooseItem(iconName: string): void {
    this.onChoose(iconName)
  }

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
