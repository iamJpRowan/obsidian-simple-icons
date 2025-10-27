import { App, PluginSettingTab, Setting, setIcon } from "obsidian"
import SimpleIconsPlugin from "./main"
import { FolderMapping, TagMapping } from "./types"

export class SimpleIconsSettingTab extends PluginSettingTab {
  plugin: SimpleIconsPlugin

  constructor(app: App, plugin: SimpleIconsPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    containerEl.createEl("h2", { text: "Simple Icons Settings" })

    // Rendering Location Toggles
    this.addRenderingLocationSettings(containerEl)

    // Association Methods
    this.addAssociationMethodSettings(containerEl)
  }

  private addRenderingLocationSettings(containerEl: HTMLElement): void {
    containerEl.createEl("h3", { text: "Rendering Locations" })
    containerEl.createEl("p", {
      text: "Choose where icons should be displayed in the Obsidian UI.",
      cls: "setting-item-description",
    })

    new Setting(containerEl)
      .setName("Render in wikilinks")
      .setDesc("Show icons next to wikilinks in reading and live preview mode")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.renderInWikilinks)
          .onChange(async value => {
            this.plugin.settings.renderInWikilinks = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName("Render in file view")
      .setDesc("Show icons in tab headers and inline titles")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.renderInFileView)
          .onChange(async value => {
            this.plugin.settings.renderInFileView = value
            await this.plugin.saveSettings()
            this.plugin.reloadRenderer()
          })
      )

    new Setting(containerEl)
      .setName("Render in file lists")
      .setDesc("Show icons in file explorer and search results")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.renderInFileLists)
          .onChange(async value => {
            this.plugin.settings.renderInFileLists = value
            await this.plugin.saveSettings()
            this.plugin.reloadRenderer()
          })
      )
  }

  private addAssociationMethodSettings(containerEl: HTMLElement): void {
    containerEl.createEl("h3", { text: "Icon Association Methods" })
    containerEl.createEl("p", {
      text: "Configure how icons are associated with files. Priority order: Frontmatter > Tags > Folders",
      cls: "setting-item-description",
    })

    // Frontmatter settings
    this.addFrontmatterSettings(containerEl)

    // Tag settings
    this.addTagSettings(containerEl)

    // Folder settings
    this.addFolderSettings(containerEl)
  }

  private addFrontmatterSettings(containerEl: HTMLElement): void {
    containerEl.createEl("h4", { text: "Frontmatter" })

    new Setting(containerEl)
      .setName("Enable frontmatter")
      .setDesc("Allow specifying icons via frontmatter property")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableFrontmatter)
          .onChange(async value => {
            this.plugin.settings.enableFrontmatter = value
            await this.plugin.saveSettings()
            this.plugin.iconResolver.updateSettings(this.plugin.settings)
            this.display()
          })
      )

    if (this.plugin.settings.enableFrontmatter) {
      new Setting(containerEl)
        .setName("Frontmatter property name")
        .setDesc("The frontmatter property to read icon names from")
        .addText(text =>
          text
            .setPlaceholder("icon")
            .setValue(this.plugin.settings.frontmatterProperty)
            .onChange(async value => {
              this.plugin.settings.frontmatterProperty = value || "icon"
              await this.plugin.saveSettings()
              this.plugin.iconResolver.updateSettings(this.plugin.settings)
            })
        )
    }
  }

  private addTagSettings(containerEl: HTMLElement): void {
    containerEl.createEl("h4", { text: "Tags" })

    new Setting(containerEl)
      .setName("Enable tags")
      .setDesc("Allow associating icons with tags")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableTags)
          .onChange(async value => {
            this.plugin.settings.enableTags = value
            await this.plugin.saveSettings()
            this.plugin.iconResolver.updateSettings(this.plugin.settings)
            this.display()
          })
      )

    if (this.plugin.settings.enableTags) {
      containerEl.createEl("p", {
        text: "Tag mappings are checked in order. Drag to reorder priority.",
        cls: "setting-item-description",
      })

      // Add new tag mapping
      new Setting(containerEl)
        .setName("Add tag mapping")
        .setDesc("Create a new tag to icon mapping")
        .addButton(button =>
          button.setButtonText("Add mapping").onClick(() => {
            this.plugin.settings.tagMappings.push({ tag: "", icon: "" })
            this.plugin.saveSettings()
            this.display()
          })
        )

      // Display existing mappings
      this.plugin.settings.tagMappings.forEach((mapping, index) => {
        this.addTagMappingRow(containerEl, mapping, index)
      })
    }
  }

  private addTagMappingRow(
    containerEl: HTMLElement,
    mapping: TagMapping,
    index: number
  ): void {
    const setting = new Setting(containerEl)
      .addText(text =>
        text
          .setPlaceholder("tag-name")
          .setValue(mapping.tag)
          .onChange(async value => {
            this.plugin.settings.tagMappings[index].tag = value
            await this.plugin.saveSettings()
            this.plugin.iconResolver.clearCache()
          })
      )
      .addText(text => {
        text
          .setPlaceholder("icon-name")
          .setValue(mapping.icon)
          .onChange(async value => {
            this.plugin.settings.tagMappings[index].icon = value
            await this.plugin.saveSettings()
            this.plugin.iconResolver.clearCache()
            this.display()
          })
        text.inputEl.addClass("icon-name-input")
      })
      .addButton(button => {
        if (mapping.icon) {
          setIcon(button.buttonEl, mapping.icon)
          button.setTooltip("Icon preview - type icon name in field above")
        } else {
          button.setButtonText("Icon")
          button.setTooltip(
            "Type icon name in field above, e.g. 'home', 'folder', 'star'"
          )
        }
        button.setDisabled(true) // Display only
      })
      .addExtraButton(button =>
        button
          .setIcon("arrow-up")
          .setTooltip("Move up")
          .onClick(async () => {
            if (index > 0) {
              const temp = this.plugin.settings.tagMappings[index]
              this.plugin.settings.tagMappings[index] =
                this.plugin.settings.tagMappings[index - 1]
              this.plugin.settings.tagMappings[index - 1] = temp
              await this.plugin.saveSettings()
              this.plugin.iconResolver.clearCache()
              this.display()
            }
          })
      )
      .addExtraButton(button =>
        button
          .setIcon("arrow-down")
          .setTooltip("Move down")
          .onClick(async () => {
            if (index < this.plugin.settings.tagMappings.length - 1) {
              const temp = this.plugin.settings.tagMappings[index]
              this.plugin.settings.tagMappings[index] =
                this.plugin.settings.tagMappings[index + 1]
              this.plugin.settings.tagMappings[index + 1] = temp
              await this.plugin.saveSettings()
              this.plugin.iconResolver.clearCache()
              this.display()
            }
          })
      )
      .addExtraButton(button =>
        button
          .setIcon("trash")
          .setTooltip("Delete")
          .onClick(async () => {
            this.plugin.settings.tagMappings.splice(index, 1)
            await this.plugin.saveSettings()
            this.plugin.iconResolver.clearCache()
            this.display()
          })
      )

    setting.infoEl.remove()
  }

  private addFolderSettings(containerEl: HTMLElement): void {
    containerEl.createEl("h4", { text: "Folders" })

    new Setting(containerEl)
      .setName("Enable folders")
      .setDesc("Allow associating icons with folder paths")
      .addToggle(toggle =>
        toggle
          .setValue(this.plugin.settings.enableFolders)
          .onChange(async value => {
            this.plugin.settings.enableFolders = value
            await this.plugin.saveSettings()
            this.plugin.iconResolver.updateSettings(this.plugin.settings)
            this.display()
          })
      )

    if (this.plugin.settings.enableFolders) {
      containerEl.createEl("p", {
        text: "Paths are relative to vault root. Deepest matching folder takes priority.",
        cls: "setting-item-description",
      })

      // Add new folder mapping
      new Setting(containerEl)
        .setName("Add folder mapping")
        .setDesc("Create a new folder to icon mapping")
        .addButton(button =>
          button.setButtonText("Add mapping").onClick(() => {
            this.plugin.settings.folderMappings.push({ path: "", icon: "" })
            this.plugin.saveSettings()
            this.display()
          })
        )

      // Display existing mappings
      this.plugin.settings.folderMappings.forEach((mapping, index) => {
        this.addFolderMappingRow(containerEl, mapping, index)
      })
    }
  }

  private addFolderMappingRow(
    containerEl: HTMLElement,
    mapping: FolderMapping,
    index: number
  ): void {
    const setting = new Setting(containerEl)
      .addText(text =>
        text
          .setPlaceholder("folder/path")
          .setValue(mapping.path)
          .onChange(async value => {
            this.plugin.settings.folderMappings[index].path = value
            await this.plugin.saveSettings()
            this.plugin.iconResolver.clearCache()
          })
      )
      .addText(text => {
        text
          .setPlaceholder("icon-name")
          .setValue(mapping.icon)
          .onChange(async value => {
            this.plugin.settings.folderMappings[index].icon = value
            await this.plugin.saveSettings()
            this.plugin.iconResolver.clearCache()
            this.display()
          })
        text.inputEl.addClass("icon-name-input")
      })
      .addButton(button => {
        if (mapping.icon) {
          setIcon(button.buttonEl, mapping.icon)
          button.setTooltip("Icon preview - type icon name in field above")
        } else {
          button.setButtonText("Icon")
          button.setTooltip(
            "Type icon name in field above, e.g. 'home', 'folder', 'star'"
          )
        }
        button.setDisabled(true) // Display only
      })
      .addExtraButton(button =>
        button
          .setIcon("trash")
          .setTooltip("Delete")
          .onClick(async () => {
            this.plugin.settings.folderMappings.splice(index, 1)
            await this.plugin.saveSettings()
            this.plugin.iconResolver.clearCache()
            this.display()
          })
      )

    setting.infoEl.remove()
  }
}
