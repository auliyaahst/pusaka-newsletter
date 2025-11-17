"use client"

import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import { useTable, UseTableConfig } from "@/components/tiptap-ui/table-button/use-table"

// --- UI Primitives ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/tiptap-ui-primitive/dropdown-menu"
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { TableIcon } from "@/components/tiptap-icons/table-icon"
import { TableAddRowIcon } from "@/components/tiptap-icons/table-add-row-icon"
import { TableAddColumnIcon } from "@/components/tiptap-icons/table-add-column-icon"
import { TableDeleteIcon } from "@/components/tiptap-icons/table-delete-icon"

export interface TableDropdownMenuProps extends UseTableConfig {
  children?: React.ReactNode
}

export const TableDropdownMenu = React.forwardRef<
  HTMLButtonElement,
  TableDropdownMenuProps
>(({ editor: providedEditor, children }, ref) => {
  const { editor } = useTiptapEditor(providedEditor)
  const {
    canInsertTable,
    canDeleteTable,
    canAddColumnAfter,
    canAddRowAfter,
    canDeleteColumn,
    canDeleteRow,
    isInTable,
    insertTable,
    deleteTable,
    addColumnAfter,
    addRowAfter,
    deleteColumn,
    deleteRow,
  } = useTable({ editor })

  if (!canInsertTable && !isInTable) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-style="ghost"
          aria-label="Table options"
          tooltip="Table options"
          ref={ref}
        >
          {children ?? <TableIcon className="tiptap-button-icon" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {!isInTable && (
          <DropdownMenuItem onClick={insertTable} disabled={!canInsertTable}>
            <TableIcon className="mr-2 h-4 w-4" />
            Insert Table
          </DropdownMenuItem>
        )}
        
        {isInTable && (
          <>
            <DropdownMenuItem onClick={addRowAfter} disabled={!canAddRowAfter}>
              <TableAddRowIcon className="mr-2 h-4 w-4" />
              Add Row
            </DropdownMenuItem>
            <DropdownMenuItem onClick={addColumnAfter} disabled={!canAddColumnAfter}>
              <TableAddColumnIcon className="mr-2 h-4 w-4" />
              Add Column
            </DropdownMenuItem>
            <div className="border-t border-gray-200 my-1" />
            <DropdownMenuItem onClick={deleteRow} disabled={!canDeleteRow}>
              <TableDeleteIcon className="mr-2 h-4 w-4" />
              Delete Row
            </DropdownMenuItem>
            <DropdownMenuItem onClick={deleteColumn} disabled={!canDeleteColumn}>
              <TableDeleteIcon className="mr-2 h-4 w-4" />
              Delete Column
            </DropdownMenuItem>
            <div className="border-t border-gray-200 my-1" />
            <DropdownMenuItem onClick={deleteTable} disabled={!canDeleteTable}>
              <TableDeleteIcon className="mr-2 h-4 w-4" />
              Delete Table
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

TableDropdownMenu.displayName = "TableDropdownMenu"
