"use client"

import * as React from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Tiptap UI ---
import { useTable, UseTableConfig } from "@/components/tiptap-ui/table-button/use-table"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Icons ---
import { TableIcon } from "@/components/tiptap-icons/table-icon"

export interface TableButtonProps
  extends Omit<ButtonProps, "type">,
    UseTableConfig {
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Callback function called when table is inserted.
   */
  onTableInserted?: () => void
}

/**
 * Button component for inserting tables in a Tiptap editor.
 */
export const TableButton = React.forwardRef<HTMLButtonElement, TableButtonProps>(
  (
    {
      editor: providedEditor,
      text,
      onTableInserted,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { canInsertTable, insertTable } = useTable({ editor })

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        insertTable()
        onTableInserted?.()
      },
      [insertTable, onTableInserted, onClick]
    )

    if (!canInsertTable) {
      return null
    }

    return (
      <Button
        type="button"
        data-style="ghost"
        aria-label="Insert table"
        tooltip="Insert table"
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? (
          <>
            <TableIcon className="tiptap-button-icon" />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

TableButton.displayName = "TableButton"
