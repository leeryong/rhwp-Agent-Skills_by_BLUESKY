# rhwp-studio Feature Map

Use this reference when testing or documenting all visible rhwp web GUI features. Always verify runtime enablement through `dispatcher.isEnabled()` or the opened menu state because several commands are context-sensitive.

## Menus

### File

- `file:new-doc`: create a blank HWP document.
- `file:open`: open HWP/HWPX through File System Access API or `#file-input` fallback.
- `file:save`: save current HWP; HWPX-source save is intentionally disabled.
- `file:page-setup`: page setup dialog.
- `file:print`: print dialog/window.
- `file:about`: about dialog.

### Edit

- `edit:undo`, `edit:redo`
- `edit:cut`, `edit:copy`, `edit:paste`
- `edit:format-copy`
- `edit:delete`, `edit:select-all`
- `edit:find`, `edit:find-replace`, `edit:find-again`, `edit:goto`
- Field context commands from command registry: `field:edit`, `field:remove`

### View

- Zoom: `view:zoom-in`, `view:zoom-out`, `view:zoom-fit-page`, `view:zoom-fit-width`, `view:zoom-50`, `view:zoom-75`, `view:zoom-100`, `view:zoom-125`, `view:zoom-150`, `view:zoom-200`, `view:zoom-300`
- Marks and rendering: `view:ctrl-mark`, `view:para-mark`, `view:border-transparent`, `view:toggle-clip`
- Dialogs/panels: `view:grid-settings`, `view:toolbox-basic`, `view:toolbox-format`

### Insert

- Objects: `insert:shape`, `insert:image`, `insert:textbox`
- Footnotes and symbols: `insert:footnote`, `insert:symbols`
- Navigation metadata: `insert:bookmark`
- Picture/object tools: `insert:picture-props`, `insert:picture-delete`, `insert:equation-edit`, `insert:caption-toggle`
- Arrange/group: `insert:arrange-front`, `insert:arrange-forward`, `insert:arrange-backward`, `insert:arrange-back`, `insert:group-shapes`, `insert:ungroup-shapes`
- Transform: `insert:rotate-cw`, `insert:rotate-ccw`, `insert:flip-horz`, `insert:flip-vert`
- Visible disabled placeholders in HTML: field input, caption positions, paragraph band, comment, endnote, hyperlink.

### Format

- Character toggles: `format:bold`, `format:italic`, `format:underline`, `format:strikethrough`, `format:emboss`, `format:engrave`, `format:outline`, `format:superscript`, `format:subscript`
- Paragraph and line: `format:line-spacing`, `format:line-spacing-decrease`, `format:line-spacing-increase`
- Size: `format:font-size-increase`, `format:font-size-decrease`
- Alignment: `format:align-left`, `format:align-center`, `format:align-right`, `format:align-justify`, `format:align-distribute`, `format:align-split`
- Dialogs: `format:char-shape`, `format:para-shape`, `format:para-num-shape`, `format:bullet-shape`, `format:style-dialog`, `format:object-properties`
- Lists and styles: `format:apply-style`, `format:toggle-numbering`, `format:toggle-bullet`, `format:apply-bullet`, `format:level-increase`, `format:level-decrease`

### Page

- Setup: `page:setup`, `page:section-settings`
- Header/footer: `page:header-create`, `page:footer-create`, `page:headerfooter-close`, `page:headerfooter-delete`, `page:headerfooter-prev`, `page:headerfooter-next`, `page:hide-headerfooter`
- Header/footer fields: `page:insert-field-pagenum`, `page:insert-field-totalpage`, `page:insert-field-filename`
- Templates: `page:apply-hf-template` with `data-is-header`, `data-apply-to`, and `data-template-id`
- Breaks: `page:break`, `page:column-break`
- Columns: `page:col-1`, `page:col-2`, `page:col-3`, `page:col-left`, `page:col-right`
- Other: `page:hide`; visible HTML placeholders include new page number, hide current page, column settings.

### Table

- Create/properties: `table:create`, `table:cell-props`
- Borders/background: `table:border-each`, `table:border-one`
- Insert/delete: `table:insert-row-above`, `table:insert-row-below`, `table:insert-col-left`, `table:insert-col-right`, `table:delete-row`, `table:delete-col`, `table:delete`
- Cell operations: `table:cell-split`, `table:cell-merge`
- Caption/formula: `table:caption-toggle`, `table:formula`
- Visible HTML placeholders include equalize height/width, block formula/sum/avg/product, thousand separator, decimal add/remove.

### Tools

- `tool:options`: settings/options dialog.

## Toolbars

### Main Toolbar

Cut/copy/paste/format copy buttons are visible; only buttons with `data-cmd` dispatch automatically. Main command buttons include control mark, paragraph mark, character shape, paragraph shape, numbering, level up/down, table, shape, image, object properties, symbols, rotate, flip, header, footer, footnote, find split menu, and header/footer editing controls.

### Style Bar

- Style dropdown: `#style-name`
- Language-specific font target: `#font-lang` values `all`, `0` Hangul, `1` English, `2` Hanja, `3` Japanese, `4` other, `5` symbols, `6` user.
- Font dropdown: `#font-name`
- Font size input and arrows: `#font-size`, `#btn-size-up`, `#btn-size-down`
- Character toggles: `#btn-bold`, `#btn-italic`, `#btn-underline`, `#btn-strike`
- Character effects menu: `#btn-charfx` plus `data-format` items.
- Color/highlight: `#btn-text-color`, `#text-color-picker`, `#btn-highlight`
- Alignment: `#btn-align-left`, `#btn-align-center`, `#btn-align-right`, `#btn-align-justify`, `#btn-align-distribute`, `#btn-align-split`
- Line spacing: `#linespacing-select`, `#btn-ls-up`, `#btn-ls-down`

## Dialogs

- Table grid picker and detailed table dialog.
- Character shape dialog.
- Paragraph shape dialog.
- Page setup dialog.
- Grid settings dialog.
- Section settings dialog.
- Numbering and bullet dialogs.
- Style dialog and style edit dialog.
- Font set and font set edit dialogs.
- Find/goto/bookmark dialogs.
- Symbols dialog.
- Equation editor dialog.
- Picture properties dialog.
- Table cell properties, cell border/background, cell split, and formula dialogs.
- Options, about, confirm, validation, and save-as dialogs.

## hwpctl Actions

Implemented action registrations include:

- Text: `InsertText`, `BreakPara`, `BreakPage`, `BreakColumn`
- Navigation: `MoveLeft`, `MoveRight`, `MoveUp`, `MoveDown`, `SelectAll`
- Clipboard: `Copy`, `Cut`, `Paste`, `Undo`, `Redo`
- Formatting: `CharShape`, `ParagraphShape`, `CharShapeBold`, `CharShapeItalic`, `CharShapeUnderline`
- Table: `TableCreate`, `TableInsertRowColumn`, `TableDeleteRowColumn`, `TableSplitCell`, `CellBorderFill`, `TablePropertyDialog`
- Page: `PageSetup`, `HeaderFooter`, `BreakSection`, `BreakColDef`, `PageNumPos`

Also inspect `src/hwpctl/action-registry.ts` for compatibility aliases and unimplemented registrations.
