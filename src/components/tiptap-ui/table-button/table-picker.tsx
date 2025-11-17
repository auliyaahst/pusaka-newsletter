"use client"

import * as React from "react"
import { cn } from "@/lib/tiptap-utils"

export interface TablePickerProps {
  onSelect: (rows: number, cols: number) => void
  onClose: () => void
  maxRows?: number
  maxCols?: number
}

export const TablePicker = React.forwardRef<HTMLDivElement, TablePickerProps>(
  ({ onSelect, onClose, maxRows = 8, maxCols = 10 }, ref) => {
    const [hoveredCell, setHoveredCell] = React.useState<{
      row: number
      col: number
    } | null>(null)

    const handleCellHover = React.useCallback(
      (row: number, col: number) => {
        setHoveredCell({ row, col })
      },
      []
    )

    const handleCellClick = React.useCallback(
      (row: number, col: number) => {
        onSelect(row + 1, col + 1)
        onClose()
      },
      [onSelect, onClose]
    )

    const isCellHighlighted = React.useCallback(
      (row: number, col: number) => {
        if (!hoveredCell) return false
        return row <= hoveredCell.row && col <= hoveredCell.col
      },
      [hoveredCell]
    )

    return (
      <div
        ref={ref}
        className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg min-w-max"
        onMouseLeave={() => setHoveredCell(null)}
      >
        <div className="mb-2 text-sm text-gray-600 text-center font-medium">
          {hoveredCell
            ? `${hoveredCell.row + 1} × ${hoveredCell.col + 1} Table`
            : 'Select table size'}
        </div>
        
        <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
          {Array.from({ length: maxRows }, (_, row) =>
            Array.from({ length: maxCols }, (_, col) => (
              <div
                key={`${row}-${col}`}
                className={cn(
                  "w-4 h-4 border border-gray-300 cursor-pointer transition-colors",
                  isCellHighlighted(row, col)
                    ? "bg-blue-500 border-blue-500"
                    : "bg-gray-50 hover:bg-blue-100"
                )}
                onMouseEnter={() => handleCellHover(row, col)}
                onClick={() => handleCellClick(row, col)}
                role="button"
                tabIndex={0}
                aria-label={`Insert ${row + 1}×${col + 1} table`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleCellClick(row, col)
                  }
                }}
              />
            ))
          )}
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-100">
          <button
            onClick={() => {
              const customRows = prompt("Enter number of rows (1-20):", "3")
              const customCols = prompt("Enter number of columns (1-20):", "3")
              
              if (customRows && customCols) {
                const rows = Math.max(1, Math.min(20, parseInt(customRows, 10) || 3))
                const cols = Math.max(1, Math.min(20, parseInt(customCols, 10) || 3))
                onSelect(rows, cols)
                onClose()
              }
            }}
            className="w-full text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-1 px-2 rounded transition-colors"
          >
            Custom size...
          </button>
        </div>
      </div>
    )
  }
)

TablePicker.displayName = "TablePicker"
