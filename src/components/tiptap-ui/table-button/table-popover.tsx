"use client"

import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import { useTable, UseTableConfig } from "@/components/tiptap-ui/table-button/use-table"
import { TablePicker } from "@/components/tiptap-ui/table-button/table-picker"

// --- UI Primitives ---
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/tiptap-ui-primitive/popover"
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { TableIcon } from "@/components/tiptap-icons/table-icon"

export interface TablePopoverProps extends UseTableConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Callback function called when table is inserted.
   */
  onTableInserted?: () => void
}

export const TablePopover = React.forwardRef<HTMLButtonElement, TablePopoverProps>(
  (
    {
      editor: providedEditor,
      text,
      onTableInserted,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { canInsertTable } = useTable({ editor })
    const [isOpen, setIsOpen] = React.useState(false)

    const handleTableInsert = React.useCallback(
      (rows: number, cols: number) => {
        if (!editor) return
        
        editor
          .chain()
          .focus()
          .insertTable({ rows, cols, withHeaderRow: true })
          .run()
        
        setIsOpen(false)
        onTableInserted?.()
      },
      [editor, onTableInserted]
    )

    if (!canInsertTable) {
      return null
    }

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            data-style="ghost"
            aria-label="Insert table"
            tooltip="Insert table"
            {...buttonProps}
            ref={ref}
          >
            <TableIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          align="start" 
          side="bottom" 
          className="p-0 w-auto border-0 shadow-lg"
          onInteractOutside={() => setIsOpen(false)}
        >
          <TablePicker
            onSelect={handleTableInsert}
            onClose={() => setIsOpen(false)}
          />
        </PopoverContent>
      </Popover>
    )
  }
)

TablePopover.displayName = "TablePopover"
