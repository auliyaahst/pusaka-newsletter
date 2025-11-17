'use client'

import { type Editor } from '@tiptap/react'
import { NodeSelection } from '@tiptap/pm/state'
import { useCallback } from 'react'

interface ImageToolbarProps {
  editor: Editor | null
}

const alignmentOptions = [
  { value: 'left', label: 'Left', icon: '⬅️' },
  { value: 'center', label: 'Center', icon: '⬌' },
  { value: 'right', label: 'Right', icon: '➡️' },
  { value: 'inline', label: 'Inline', icon: '📝' },
] as const

export function ImageToolbar({ editor }: ImageToolbarProps) {
  const insertImage = useCallback((align: 'left' | 'center' | 'right' | 'inline' = 'center') => {
    if (!editor) return

    const url = window.prompt('Enter image URL:')
    if (!url) return

    const alt = window.prompt('Enter alt text (optional):') || ''
    const title = window.prompt('Enter title (optional):') || ''

    editor.chain().focus().setPositionedImage({
      src: url,
      alt,
      title,
      align,
    }).run()
  }, [editor])

  const insertImageFile = useCallback((align: 'left' | 'center' | 'right' | 'inline' = 'center') => {
    if (!editor) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Create a temporary URL for the file
      const url = URL.createObjectURL(file)
      
      editor.chain().focus().setPositionedImage({
        src: url,
        alt: file.name,
        align,
      }).run()

      // You might want to upload the file to your server here
      // and replace the blob URL with the actual URL
    }
    
    input.click()
  }, [editor])

  const updateImageAlignment = useCallback((align: 'left' | 'center' | 'right' | 'inline') => {
    if (!editor) return

    const { state } = editor
    const { selection } = state
    const node = state.doc.nodeAt(selection.from)

    if (node && node.type.name === 'positionedImage') {
      editor.chain().focus().updateAttributes('positionedImage', { align }).run()
    }
  }, [editor])

  if (!editor) return null

  // Check if an image is selected
  const { state } = editor
  const { selection } = state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedNode = selection instanceof NodeSelection ? (selection as any).node : null
  const isImageSelected = selectedNode && selectedNode.type.name === 'positionedImage'
  const currentAlign = isImageSelected ? selectedNode.attrs.align : 'center'

  return (
    <div className="image-toolbar">
      {/* Image insertion buttons */}
      <div className="flex gap-2 items-center border-r border-gray-300 pr-3">
        <span className="text-sm font-medium text-gray-700">Add Image:</span>
        <div className="flex gap-1">
          {alignmentOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => insertImageFile(option.value)}
              className="image-align-button text-xs"
              title={`Insert ${option.label} Aligned Image`}
            >
              {option.icon} {option.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => insertImage()}
          className="image-align-button text-xs"
          title="Insert Image from URL"
        >
          🔗 URL
        </button>
      </div>

      {/* Alignment controls (only show when image is selected) */}
      {isImageSelected && (
        <div className="flex gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Align:</span>
          <div className="flex gap-1">
            {alignmentOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateImageAlignment(option.value)}
                className={`image-align-button text-xs ${
                  currentAlign === option.value ? 'active' : ''
                }`}
                title={`Align ${option.label}`}
              >
                {option.icon}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageToolbar
