"use client"

import * as React from "react"
import { Editor } from "@tiptap/react"

export interface UseTableConfig {
  /**
   * The editor instance.
   */
  editor?: Editor | null
}

export function useTable({ editor }: UseTableConfig = {}) {
  const canInsertTable = React.useMemo(() => {
    if (!editor) return false
    return editor.can().insertTable()
  }, [editor])

  const canDeleteTable = React.useMemo(() => {
    if (!editor) return false
    return editor.can().deleteTable()
  }, [editor])

  const canAddColumnBefore = React.useMemo(() => {
    if (!editor) return false
    return editor.can().addColumnBefore()
  }, [editor])

  const canAddColumnAfter = React.useMemo(() => {
    if (!editor) return false
    return editor.can().addColumnAfter()
  }, [editor])

  const canDeleteColumn = React.useMemo(() => {
    if (!editor) return false
    return editor.can().deleteColumn()
  }, [editor])

  const canAddRowBefore = React.useMemo(() => {
    if (!editor) return false
    return editor.can().addRowBefore()
  }, [editor])

  const canAddRowAfter = React.useMemo(() => {
    if (!editor) return false
    return editor.can().addRowAfter()
  }, [editor])

  const canDeleteRow = React.useMemo(() => {
    if (!editor) return false
    return editor.can().deleteRow()
  }, [editor])

  const isInTable = React.useMemo(() => {
    if (!editor) return false
    return editor.isActive('table')
  }, [editor])

  const insertTable = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const deleteTable = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().deleteTable().run()
  }, [editor])

  const addColumnBefore = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().addColumnBefore().run()
  }, [editor])

  const addColumnAfter = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().addColumnAfter().run()
  }, [editor])

  const deleteColumn = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().deleteColumn().run()
  }, [editor])

  const addRowBefore = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().addRowBefore().run()
  }, [editor])

  const addRowAfter = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().addRowAfter().run()
  }, [editor])

  const deleteRow = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().deleteRow().run()
  }, [editor])

  return {
    canInsertTable,
    canDeleteTable,
    canAddColumnBefore,
    canAddColumnAfter,
    canDeleteColumn,
    canAddRowBefore,
    canAddRowAfter,
    canDeleteRow,
    isInTable,
    insertTable,
    deleteTable,
    addColumnBefore,
    addColumnAfter,
    deleteColumn,
    addRowBefore,
    addRowAfter,
    deleteRow,
  }
}
