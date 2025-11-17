"use client"

import * as React from "react"
import { EnhancedEditor } from "@/components/tiptap-templates/enhanced"

interface SimpleEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  height?: string
}

export function SimpleEditor({ 
  value = '', 
  onChange,
  placeholder = 'Start writing your amazing article here...',
  className = '',
  height: containerHeight = '400px'
}: SimpleEditorProps = {}) {
  
  return (
    <div className={className}>
      <EnhancedEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        height={containerHeight}
      />
    </div>
  )
}
