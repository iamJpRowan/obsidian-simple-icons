/**
 * TagMappingModal.ts
 *
 * This file provides a comprehensive modal interface for managing tag-to-icon mappings.
 * Features include search, drag-and-drop reordering, inline editing, import/export,
 * and keyboard navigation.
 */

import { App, Modal, setIcon, Notice } from "obsidian"
import SimpleIconsPlugin from "./main"
import { TagMapping } from "./types"

interface MappingRow {
  mapping: TagMapping
  index: number
  element: HTMLElement
  tagInput: HTMLInputElement
  iconInput: HTMLInputElement
  tagSuggestionsEl?: HTMLElement
  iconSuggestionsEl?: HTMLElement
}

/**
 * Modal for managing tag-to-icon mappings with priority ordering
 *
 * Provides a dedicated interface for managing tag mappings with:
 * - Real-time search filtering
 * - Drag-and-drop reordering
 * - Inline editing
 * - Import/export functionality
 * - Keyboard navigation
 */
export class TagMappingModal extends Modal {
  private plugin: SimpleIconsPlugin
  private mappings: TagMapping[]
  private filteredMappings: TagMapping[]
  private searchQuery = ""
  private rows: MappingRow[] = []
  private draggedRow: MappingRow | null = null
  private dragOverIndex: number | null = null
  private savedIndicatorTimeout: number | null = null
  private allVaultTags: Set<string> = new Set()
  private commonIconNames: string[] = []

  // UI elements
  private searchInput: HTMLInputElement
  public contentEl: HTMLElement
  private statusBar: HTMLElement
  private mappingsContainer: HTMLElement

  constructor(app: App, plugin: SimpleIconsPlugin) {
    super(app)
    this.plugin = plugin
    // Create a copy of mappings to work with
    this.mappings = [...plugin.settings.tagMappings]
    this.filteredMappings = [...this.mappings]
    // Load vault tags and common icon names
    this.loadVaultTags()
    this.loadCommonIconNames()
  }

  /**
   * Loads all unique tags from the vault
   */
  private loadVaultTags(): void {
    const tags = new Set<string>()
    const files = this.app.vault.getMarkdownFiles()
    
    for (const file of files) {
      const metadata = this.app.metadataCache.getFileCache(file)
      if (metadata?.tags) {
        for (const tag of metadata.tags) {
          const tagName = tag.tag.startsWith("#") ? tag.tag.substring(1) : tag.tag
          tags.add(tagName)
        }
      }
      if (metadata?.frontmatter?.tags) {
        const frontmatterTags = Array.isArray(metadata.frontmatter.tags)
          ? metadata.frontmatter.tags
          : [metadata.frontmatter.tags]
        for (const tag of frontmatterTags) {
          if (typeof tag === "string") {
            const tagName = tag.trim().startsWith("#") ? tag.trim().substring(1) : tag.trim()
            if (tagName) tags.add(tagName)
          }
        }
      }
    }
    
    this.allVaultTags = tags
  }

  /**
   * Loads all Lucide icon names for suggestions
   * Accesses the Lucide icon library directly from the global scope
   */
  private loadCommonIconNames(): void {
    // Try accessing Lucide library directly from global scope
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lucide = (window as any).lucide || (globalThis as any).lucide
    
    if (lucide && lucide.icons) {
      // Get all icon names from Lucide's icon registry
      this.commonIconNames = Object.keys(lucide.icons)
    } else {
      // Fallback: Empty array if Lucide isn't accessible
      this.commonIconNames = []
      console.warn("Could not access Lucide icon library - icon suggestions will be limited")
    }
  }

  /**
   * Opens the modal and sets up the UI
   */
  onOpen(): void {
    this.contentEl.empty()
    this.contentEl.addClass("tag-mapping-modal")

    // Header
    const header = this.contentEl.createDiv({ cls: "tag-mapping-modal-header" })
    header.createEl("h2", { text: "Tag Mappings" })
    
    // Explanation text
    header.createEl("p", {
      text: "Tag mappings are checked in priority order. Drag items to reorder. Higher priority (lower number) takes precedence.",
      cls: "tag-mapping-explanation",
    })

    // Search bar
    const searchContainer = header.createDiv({ cls: "tag-mapping-search-container" })
    this.searchInput = searchContainer.createEl("input", {
      type: "text",
      placeholder: "Search tag names or icon names...",
      cls: "tag-mapping-search-input",
    })
    this.searchInput.addEventListener("input", () => this.handleSearch())
    this.searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.searchInput.value = ""
        this.handleSearch()
        this.searchInput.blur()
      }
    })

    // Toolbar
    const toolbar = this.contentEl.createDiv({ cls: "tag-mapping-toolbar" })
    
    const addButton = toolbar.createEl("button", {
      text: "Add new",
      cls: "mod-cta",
    })
    setIcon(addButton, "plus")
    addButton.addEventListener("click", () => this.addNewMapping())

    const importExportContainer = toolbar.createDiv({ cls: "tag-mapping-import-export" })
    const exportButton = importExportContainer.createEl("button", {
      cls: "tag-mapping-icon-btn",
      attr: { "aria-label": "Export", title: "Export mappings" },
    })
    setIcon(exportButton, "download")
    exportButton.addEventListener("click", () => this.exportMappings())

    const importButton = importExportContainer.createEl("button", {
      cls: "tag-mapping-icon-btn",
      attr: { "aria-label": "Import", title: "Import mappings" },
    })
    setIcon(importButton, "upload")
    importButton.addEventListener("click", () => this.importMappings())

    // Main content area
    this.mappingsContainer = this.contentEl.createDiv({
      cls: "tag-mapping-mappings-container",
    })

    // Footer
    const footer = this.contentEl.createDiv({ cls: "tag-mapping-modal-footer" })
    this.statusBar = footer.createDiv({ cls: "tag-mapping-status-bar" })
    this.updateStatusBar()

    const closeButton = footer.createEl("button", {
      text: "Close",
      cls: "mod-cta",
    })
    closeButton.addEventListener("click", () => this.close())

    // Render initial mappings
    this.renderMappings()

    // Focus search input
    setTimeout(() => this.searchInput.focus(), 100)

    // Keyboard shortcuts
    this.scope.register(["Ctrl", "Meta"], "f", (e) => {
      e.preventDefault()
      this.searchInput.focus()
      this.searchInput.select()
    })

    this.scope.register(["Ctrl", "Meta"], "n", (e) => {
      e.preventDefault()
      this.addNewMapping()
    })
  }

  /**
   * Handles search input changes
   */
  private handleSearch(): void {
    this.searchQuery = this.searchInput.value.toLowerCase().trim()
    
    if (!this.searchQuery) {
      this.filteredMappings = [...this.mappings]
    } else {
      this.filteredMappings = this.mappings.filter(
        (m) =>
          m.tag.toLowerCase().includes(this.searchQuery) ||
          m.icon.toLowerCase().includes(this.searchQuery)
      )
    }
    
    this.renderMappings()
    this.updateStatusBar()
  }

  /**
   * Renders the mappings list
   */
  private renderMappings(): void {
    // Hide all suggestions before re-rendering
    this.hideAllSuggestions()
    
    this.mappingsContainer.empty()
    this.rows = []

    if (this.filteredMappings.length === 0) {
      this.renderEmptyState()
      return
    }

    this.filteredMappings.forEach((mapping, displayIndex) => {
      // Find the actual index in the full mappings array
      const actualIndex = this.mappings.findIndex(
        (m) => m.tag === mapping.tag && m.icon === mapping.icon
      )
      
      const row = this.createMappingRow(mapping, actualIndex, displayIndex)
      this.rows.push(row)
      this.mappingsContainer.appendChild(row.element)
    })
  }

  /**
   * Renders empty state message
   */
  private renderEmptyState(): void {
    const emptyState = this.mappingsContainer.createDiv({
      cls: "tag-mapping-empty-state",
    })
    
    emptyState.createEl("p", {
      text: this.searchQuery
        ? `No mappings found matching "${this.searchQuery}"`
        : "No tag mappings yet.",
    })
    
    if (!this.searchQuery) {
      emptyState.createEl("p", {
        text: "Click 'Add New Mapping' to get started.",
        cls: "tag-mapping-empty-hint",
      })
      
      // Show example
      const example = emptyState.createDiv({ cls: "tag-mapping-example" })
      example.createEl("span", { text: "#project" })
      example.createEl("span", { text: "→" })
      example.createEl("span", { text: "folder" })
      const iconEl = example.createSpan()
      setIcon(iconEl, "folder")
    } else {
      const addButton = emptyState.createEl("button", {
        text: `Add mapping with "${this.searchQuery}"`,
        cls: "mod-cta",
      })
      addButton.addEventListener("click", () => {
        this.addNewMappingWithSearchTerm(this.searchQuery)
      })
    }
  }

  /**
   * Creates a single mapping row element with always-editable inputs
   */
  private createMappingRow(
    mapping: TagMapping,
    actualIndex: number,
    displayIndex: number
  ): MappingRow {
    const rowEl = document.createElement("div")
    rowEl.className = "tag-mapping-row"
    rowEl.setAttribute("data-index", actualIndex.toString())
    
    if (this.draggedRow?.index === actualIndex) {
      rowEl.addClass("dragging")
    }
    if (this.dragOverIndex === displayIndex && this.draggedRow) {
      rowEl.addClass("drag-over")
    }

    // Priority indicator
    const priorityEl = rowEl.createDiv({ cls: "tag-mapping-priority" })
    priorityEl.createEl("span", { text: `${actualIndex + 1}` })

    // Tag input with suggestions
    const tagContainer = rowEl.createDiv({ cls: "tag-mapping-tag-container" })
    const tagInput = tagContainer.createEl("input", {
      type: "text",
      value: mapping.tag,
      placeholder: "tag-name",
      cls: "tag-mapping-tag-input",
    })
    tagInput.addEventListener("input", () => {
      mapping.tag = tagInput.value.trim()
      this.updateIconPreview(actualIndex)
      this.showTagSuggestions(tagInput, actualIndex)
      this.autoSave()
    })
    tagInput.addEventListener("focus", () => {
      this.showTagSuggestions(tagInput, actualIndex)
    })
    tagInput.addEventListener("blur", (e) => {
      // Delay hiding to allow clicking suggestions
      setTimeout(() => {
        this.hideTagSuggestions(actualIndex)
      }, 200)
    })

    // Arrow separator
    rowEl.createEl("span", { text: "→", cls: "tag-mapping-arrow" })

    // Icon input with suggestions
    const iconContainer = rowEl.createDiv({ cls: "tag-mapping-icon-container" })
    const iconInput = iconContainer.createEl("input", {
      type: "text",
      value: mapping.icon,
      placeholder: "icon-name",
      cls: "tag-mapping-icon-input",
    })
    iconInput.addEventListener("input", () => {
      mapping.icon = iconInput.value.trim()
      this.updateIconPreview(actualIndex)
      this.showIconSuggestions(iconInput, actualIndex)
      this.autoSave()
    })
    iconInput.addEventListener("focus", () => {
      this.showIconSuggestions(iconInput, actualIndex)
    })
    iconInput.addEventListener("blur", (e) => {
      setTimeout(() => {
        this.hideIconSuggestions(actualIndex)
      }, 200)
    })

    // Icon preview
    const iconPreviewEl = rowEl.createDiv({ cls: "tag-mapping-icon-preview" })
    this.updateIconPreviewElement(iconPreviewEl, mapping.icon)

    // Action buttons container
    const actionsEl = rowEl.createDiv({ cls: "tag-mapping-actions" })

    // Move to top
    const moveTopButton = actionsEl.createDiv({
      cls: "tag-mapping-action-btn",
      attr: { "aria-label": "Move to top", role: "button", tabindex: "0" },
    })
    setIcon(moveTopButton, "arrow-up-to-line")
    moveTopButton.addEventListener("click", () => this.moveToTop(actualIndex))
    moveTopButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        this.moveToTop(actualIndex)
      }
    })

    // Move to bottom
    const moveBottomButton = actionsEl.createDiv({
      cls: "tag-mapping-action-btn",
      attr: { "aria-label": "Move to bottom", role: "button", tabindex: "0" },
    })
    setIcon(moveBottomButton, "arrow-down-to-line")
    moveBottomButton.addEventListener("click", () => this.moveToBottom(actualIndex))
    moveBottomButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        this.moveToBottom(actualIndex)
      }
    })

    // Delete button
    const deleteButton = actionsEl.createDiv({
      cls: "tag-mapping-action-btn tag-mapping-delete-btn",
      attr: { "aria-label": "Delete", role: "button", tabindex: "0" },
    })
    setIcon(deleteButton, "trash")
    deleteButton.addEventListener("click", () => this.deleteMapping(actualIndex))
    deleteButton.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        this.deleteMapping(actualIndex)
      }
    })

    // Drag handle
    const dragHandle = rowEl.createDiv({ cls: "tag-mapping-drag-handle" })
    dragHandle.setAttribute("title", "Drag to reorder")
    dragHandle.innerHTML = "⋮⋮"
    dragHandle.addEventListener("mousedown", (e) => this.startDrag(e, actualIndex))

    return {
      mapping,
      index: actualIndex,
      element: rowEl,
      tagInput,
      iconInput,
    }
  }

  /**
   * Shows tag suggestions dropdown
   */
  private showTagSuggestions(input: HTMLInputElement, index: number): void {
    const row = this.rows.find((r) => r.index === index)
    if (!row) return

    // Remove existing suggestions
    this.hideTagSuggestions(index)

    const query = input.value.toLowerCase().trim()
    const matchingTags = Array.from(this.allVaultTags)
      .filter(tag => tag.toLowerCase().includes(query))
      .sort()
      .slice(0, 10)

    if (matchingTags.length === 0 && query === "") {
      matchingTags.push(...Array.from(this.allVaultTags).sort().slice(0, 10))
    }

    if (matchingTags.length === 0) return

    const suggestionsEl = document.createElement("div")
    suggestionsEl.className = "tag-mapping-suggestions"
    suggestionsEl.style.position = "absolute"
    suggestionsEl.style.zIndex = "1000"
    
    const inputRect = input.getBoundingClientRect()
    suggestionsEl.style.top = `${inputRect.bottom + 2}px`
    suggestionsEl.style.left = `${inputRect.left}px`
    suggestionsEl.style.minWidth = `${inputRect.width}px`

    matchingTags.forEach(tag => {
      const item = suggestionsEl.createDiv({
        cls: "tag-mapping-suggestion-item",
      })
      item.textContent = tag
      item.addEventListener("mousedown", (e) => {
        e.preventDefault()
        input.value = tag
        row.mapping.tag = tag
        this.updateIconPreview(index)
        this.autoSave()
        input.focus()
        this.hideTagSuggestions(index)
      })
    })

    document.body.appendChild(suggestionsEl)
    row.tagSuggestionsEl = suggestionsEl
  }

  /**
   * Hides tag suggestions dropdown
   */
  private hideTagSuggestions(index: number): void {
    const row = this.rows.find((r) => r.index === index)
    if (row?.tagSuggestionsEl) {
      row.tagSuggestionsEl.remove()
      row.tagSuggestionsEl = undefined
    }
  }

  /**
   * Shows icon suggestions dropdown
   */
  private showIconSuggestions(input: HTMLInputElement, index: number): void {
    const row = this.rows.find((r) => r.index === index)
    if (!row) return

    // Remove existing suggestions
    this.hideIconSuggestions(index)

    const query = input.value.toLowerCase().trim()
    const matchingIcons = this.commonIconNames
      .filter(icon => icon.toLowerCase().includes(query))
      .slice(0, 10)

    if (matchingIcons.length === 0 && query === "") {
      matchingIcons.push(...this.commonIconNames.slice(0, 10))
    }

    if (matchingIcons.length === 0) return

    const suggestionsEl = document.createElement("div")
    suggestionsEl.className = "tag-mapping-suggestions"
    suggestionsEl.style.position = "absolute"
    suggestionsEl.style.zIndex = "1000"
    
    const inputRect = input.getBoundingClientRect()
    suggestionsEl.style.top = `${inputRect.bottom + 2}px`
    suggestionsEl.style.left = `${inputRect.left}px`
    suggestionsEl.style.minWidth = `${inputRect.width}px`

    matchingIcons.forEach(iconName => {
      const item = suggestionsEl.createDiv({
        cls: "tag-mapping-suggestion-item",
      })
      
      const iconEl = item.createSpan({ cls: "tag-mapping-suggestion-icon" })
      try {
        setIcon(iconEl, iconName)
      } catch (e) {
        // Icon not found, show placeholder
        iconEl.createEl("span", { text: "?", cls: "invalid-icon" })
      }
      
      item.createSpan({ text: iconName, cls: "tag-mapping-suggestion-text" })
      
      item.addEventListener("mousedown", (e) => {
        e.preventDefault()
        input.value = iconName
        row.mapping.icon = iconName
        this.updateIconPreview(index)
        this.autoSave()
        input.focus()
        this.hideIconSuggestions(index)
      })
    })

    document.body.appendChild(suggestionsEl)
    row.iconSuggestionsEl = suggestionsEl
  }

  /**
   * Hides icon suggestions dropdown
   */
  private hideIconSuggestions(index: number): void {
    const row = this.rows.find((r) => r.index === index)
    if (row?.iconSuggestionsEl) {
      row.iconSuggestionsEl.remove()
      row.iconSuggestionsEl = undefined
    }
  }

  /**
   * Hides all suggestion dropdowns
   */
  private hideAllSuggestions(): void {
    this.rows.forEach(row => {
      this.hideTagSuggestions(row.index)
      this.hideIconSuggestions(row.index)
    })
    // Also clean up any orphaned suggestions in the DOM
    document.querySelectorAll(".tag-mapping-suggestions").forEach(el => el.remove())
  }

  /**
   * Updates icon preview for a specific row
   */
  private updateIconPreview(index: number): void {
    const row = this.rows.find((r) => r.index === index)
    if (!row) return

    const previewEl = row.element.querySelector(".tag-mapping-icon-preview") as HTMLElement
    if (previewEl) {
      this.updateIconPreviewElement(previewEl, row.mapping.icon)
    }
  }

  /**
   * Updates icon preview element
   */
  private updateIconPreviewElement(element: HTMLElement, iconName: string): void {
    element.empty()
    if (iconName) {
      try {
        setIcon(element, iconName)
        element.setAttribute("title", iconName)
      } catch (e) {
        element.createEl("span", { text: "?", cls: "invalid-icon" })
        element.setAttribute("title", "Invalid icon name")
      }
    } else {
      element.createEl("span", { text: "—", cls: "no-icon" })
    }
  }

  /**
   * Adds a new mapping
   */
  private addNewMapping(): void {
    this.addNewMappingWithSearchTerm("")
  }

  /**
   * Adds a new mapping with optional search term pre-filled
   */
  private addNewMappingWithSearchTerm(searchTerm: string): void {
    // Add at the beginning for highest priority
    const newMapping: TagMapping = { tag: searchTerm, icon: "" }
    this.mappings.unshift(newMapping)
    this.autoSave()
    this.handleSearch()

    // Focus the tag input of the new mapping
    setTimeout(() => {
      const newRow = this.rows.find((r) => r.index === 0)
      if (newRow) {
        newRow.tagInput.focus()
      }
    }, 100)
  }

  /**
   * Deletes a mapping
   */
  private deleteMapping(index: number): void {
    this.mappings.splice(index, 1)
    this.autoSave()
    this.handleSearch()
  }

  /**
   * Moves a mapping to the top (highest priority)
   */
  private moveToTop(index: number): void {
    if (index === 0) return
    
    const mapping = this.mappings.splice(index, 1)[0]
    this.mappings.unshift(mapping)
    this.autoSave()
    this.handleSearch()
  }

  /**
   * Moves a mapping to the bottom (lowest priority)
   */
  private moveToBottom(index: number): void {
    if (index === this.mappings.length - 1) return
    
    const mapping = this.mappings.splice(index, 1)[0]
    this.mappings.push(mapping)
    this.autoSave()
    this.handleSearch()
  }

  /**
   * Starts drag operation
   */
  private startDrag(e: MouseEvent, index: number): void {
    e.preventDefault()
    e.stopPropagation()

    const row = this.rows.find((r) => r.index === index)
    if (!row) return

    this.draggedRow = row
    row.element.addClass("dragging")

    const handleMouseMove = (e: MouseEvent) => {
      const rect = this.mappingsContainer.getBoundingClientRect()
      const y = e.clientY - rect.top
      
      // Find which row we're over
      let overIndex = -1
      for (let i = 0; i < this.rows.length; i++) {
        const rowRect = this.rows[i].element.getBoundingClientRect()
        const rowTop = rowRect.top - rect.top
        const rowBottom = rowTop + rowRect.height
        
        if (y >= rowTop && y <= rowBottom) {
          overIndex = i
          break
        }
      }

      // Update drag over indicator
      this.rows.forEach((r) => r.element.removeClass("drag-over"))
      if (overIndex !== -1 && this.rows[overIndex].index !== index) {
        this.dragOverIndex = overIndex
        this.rows[overIndex].element.addClass("drag-over")
      } else {
        this.dragOverIndex = null
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)

      if (this.dragOverIndex !== null && this.draggedRow) {
        const targetRow = this.rows[this.dragOverIndex]
        const fromIndex = this.draggedRow.index
        const toIndex = targetRow.index

        // Perform reorder
        const mapping = this.mappings[fromIndex]
        this.mappings.splice(fromIndex, 1)
        this.mappings.splice(toIndex, 0, mapping)
        this.autoSave()
      }

      // Clean up
      this.rows.forEach((r) => {
        r.element.removeClass("dragging")
        r.element.removeClass("drag-over")
      })
      this.draggedRow = null
      this.dragOverIndex = null
      this.handleSearch() // Re-render
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  /**
   * Auto-saves changes to plugin settings
   */
  private async autoSave(): Promise<void> {
    // Update plugin settings
    this.plugin.settings.tagMappings = [...this.mappings]
    await this.plugin.saveSettings()
    this.plugin.iconResolver.clearCache()

    // Show saved indicator
    this.showSavedIndicator()
  }

  /**
   * Shows a brief "Saved" indicator
   */
  private showSavedIndicator(): void {
    if (this.savedIndicatorTimeout) {
      clearTimeout(this.savedIndicatorTimeout)
    }

    // Add saved class to status bar
    this.statusBar.addClass("saved")
    this.statusBar.textContent = "✓ Saved"

    this.savedIndicatorTimeout = window.setTimeout(() => {
      this.statusBar.removeClass("saved")
      this.updateStatusBar()
    }, 2000)
  }

  /**
   * Updates the status bar
   */
  private updateStatusBar(): void {
    const total = this.mappings.length
    const showing = this.filteredMappings.length

    if (this.searchQuery && showing < total) {
      this.statusBar.textContent = `Showing ${showing} of ${total} mappings`
    } else {
      this.statusBar.textContent = `${total} mapping${total !== 1 ? "s" : ""}`
    }
  }

  /**
   * Exports mappings to JSON file
   */
  private async exportMappings(): Promise<void> {
    const dataStr = JSON.stringify(this.mappings, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `tag-mappings-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    new Notice("Tag mappings exported successfully")
  }

  /**
   * Imports mappings from JSON file
   */
  private async importMappings(): Promise<void> {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    
    input.addEventListener("change", async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const imported: TagMapping[] = JSON.parse(text)

        // Validate structure
        if (!Array.isArray(imported)) {
          throw new Error("Invalid format: expected array")
        }

        for (const item of imported) {
          if (!item.hasOwnProperty("tag") || !item.hasOwnProperty("icon")) {
            throw new Error("Invalid format: missing tag or icon property")
          }
        }

        // Show preview and ask for merge or replace
        const action = await new Promise<"merge" | "replace" | "cancel">((resolve) => {
          const modal = new Modal(this.app)
          modal.contentEl.createEl("h2", { text: "Import Tag Mappings" })
          modal.contentEl.createEl("p", {
            text: `Found ${imported.length} mappings to import.`,
          })
          modal.contentEl.createEl("p", {
            text: `Current mappings: ${this.mappings.length}`,
          })

          const buttonContainer = modal.contentEl.createDiv({
            cls: "tag-mapping-import-actions",
          })

          const mergeButton = buttonContainer.createEl("button", {
            text: "Merge",
            cls: "mod-cta",
          })
          mergeButton.addEventListener("click", () => {
            modal.close()
            resolve("merge")
          })

          const replaceButton = buttonContainer.createEl("button", {
            text: "Replace All",
          })
          replaceButton.addEventListener("click", () => {
            modal.close()
            resolve("replace")
          })

          const cancelButton = buttonContainer.createEl("button", {
            text: "Cancel",
          })
          cancelButton.addEventListener("click", () => {
            modal.close()
            resolve("cancel")
          })

          modal.open()
        })

        if (action === "cancel") return

        // Handle duplicates
        const duplicates: TagMapping[] = []
        if (action === "merge") {
          for (const importedMapping of imported) {
            const existing = this.mappings.find(
              (m) => m.tag.toLowerCase() === importedMapping.tag.toLowerCase()
            )
            if (existing) {
              duplicates.push(importedMapping)
            }
          }
        }

        if (duplicates.length > 0) {
          const handleDuplicates = await new Promise<"skip" | "replace">((resolve) => {
            const modal = new Modal(this.app)
            modal.contentEl.createEl("h2", { text: "Duplicate Tags Found" })
            modal.contentEl.createEl("p", {
              text: `Found ${duplicates.length} duplicate tag(s). How would you like to handle them?`,
            })

            const list = modal.contentEl.createEl("ul")
            duplicates.forEach((d) => {
              list.createEl("li", { text: `#${d.tag} → ${d.icon}` })
            })

            const buttonContainer = modal.contentEl.createDiv({
              cls: "tag-mapping-import-actions",
            })

            const skipButton = buttonContainer.createEl("button", {
              text: "Skip Duplicates",
              cls: "mod-cta",
            })
            skipButton.addEventListener("click", () => {
              modal.close()
              resolve("skip")
            })

            const replaceButton = buttonContainer.createEl("button", {
              text: "Replace Existing",
            })
            replaceButton.addEventListener("click", () => {
              modal.close()
              resolve("replace")
            })

            modal.open()
          })

          if (handleDuplicates === "replace") {
            // Remove existing duplicates
            duplicates.forEach((d) => {
              const index = this.mappings.findIndex(
                (m) => m.tag.toLowerCase() === d.tag.toLowerCase()
              )
              if (index !== -1) {
                this.mappings.splice(index, 1)
              }
            })
          } else {
            // Remove duplicates from import
            imported.forEach((imp, idx) => {
              if (
                duplicates.some(
                  (d) => d.tag.toLowerCase() === imp.tag.toLowerCase()
                )
              ) {
                imported.splice(idx, 1)
              }
            })
          }
        }

        // Apply import
        if (action === "replace") {
          this.mappings = imported
        } else {
          this.mappings.push(...imported)
        }

        await this.autoSave()
        this.handleSearch()
        new Notice(`Successfully imported ${imported.length} mapping(s)`)
      } catch (error) {
        new Notice(`Import failed: ${error.message}`)
        console.error(error)
      }
    })

    input.click()
  }

  /**
   * Closes the modal
   */
  onClose(): void {
    // Hide all suggestions
    this.rows.forEach(row => {
      this.hideTagSuggestions(row.index)
      this.hideIconSuggestions(row.index)
    })
    this.contentEl.empty()
  }
}

