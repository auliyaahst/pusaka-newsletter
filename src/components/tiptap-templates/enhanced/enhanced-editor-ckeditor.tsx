"use client"

import * as React from "react"
import { EditorContent, useEditor, Editor } from "@tiptap/react"
import { Extension, findParentNode, Node } from '@tiptap/core'
import toast from 'react-hot-toast'

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableHeader } from "@tiptap/extension-table-header"
import { TableCell } from "@tiptap/extension-table-cell"

// Extend TipTap Commands type
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    captionBox: {
      insertCaptionBox: () => ReturnType
    }
  }
}

// Custom Table extension that preserves class attribute
const CustomTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) {
            return {}
          }
          return {
            class: attributes.class
          }
        },
      },
    }
  },
})

// Caption Box Extension - A styled container for captions and info boxes
const CaptionBox = Node.create({
  name: 'captionBox',

  group: 'block',

  content: 'inline*',
  
  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: element => {
          const width = element.style.width
          return width ? Number.parseInt(width) : null
        },
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return {
            style: `width: ${attributes.width}px`,
          }
        },
      },
      float: {
        default: 'none',
        parseHTML: element => {
          const float = element.getAttribute('data-float')
          return float || 'none'
        },
        renderHTML: attributes => {
          return {
            'data-float': attributes.float,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div.caption-box',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, class: 'caption-box' }, 0]
  },

  addCommands() {
    return {
      insertCaptionBox:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: 'text',
                text: 'Type your caption or text here...',
              },
            ],
          })
        },
    }
  },
})

// --- Advanced Extensions ---
import { Color } from "@tiptap/extension-color"
import { TextStyle } from "@tiptap/extension-text-style"
import { FontFamily } from "@tiptap/extension-font-family"
import { Underline } from "@tiptap/extension-underline"
import { Link } from "@tiptap/extension-link"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Focus } from "@tiptap/extension-focus"
import { CharacterCount } from "@tiptap/extension-character-count"
import { Dropcursor } from "@tiptap/extension-dropcursor"
import { Gapcursor } from "@tiptap/extension-gapcursor"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Styles ---
import "./enhanced-editor-ckeditor.scss"

interface EnhancedEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  height?: string
  onEditorReady?: (editor: { getHTML: () => string }) => void
}

// Add a ref type for imperative access
export interface EnhancedEditorRef {
  getContent: () => string
  setContent: (content: string) => void
}

// Custom FontSize Extension
const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

// Custom Image Extension with Text Wrapping and Enhanced Selection
const ImageWithWrapping = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      float: {
        default: 'none',
        renderHTML: attributes => {
          if (!attributes.float || attributes.float === 'none') {
            return {}
          }
          return {
            style: `float: ${attributes.float}; margin: ${attributes.float === 'left' ? '0 16px 16px 0' : '0 0 16px 16px'};`
          }
        },
        parseHTML: element => element.style.float || 'none',
      },
      width: {
        default: null,
        renderHTML: attributes => {
          if (!attributes.width) {
            return {}
          }
          return {
            style: `width: ${attributes.width}px;`
          }
        },
        parseHTML: element => {
          const width = element.style.width || element.getAttribute('width')
          return width ? parseInt(width) : null
        },
      },
    }
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const img = document.createElement('img')
      
      // Set image attributes
      img.src = node.attrs.src
      img.className = 'editor-image'
      if (node.attrs.alt) img.alt = node.attrs.alt
      if (node.attrs.title) img.title = node.attrs.title
      if (node.attrs.width) img.style.width = `${node.attrs.width}px`
      if (node.attrs.float && node.attrs.float !== 'none') {
        img.style.float = node.attrs.float
        img.style.margin = node.attrs.float === 'left' ? '0 16px 16px 0' : '0 0 16px 16px'
      }
      
      // Add click handler for immediate selection
      img.addEventListener('click', () => {
        if (typeof getPos === 'function') {
          const pos = getPos()
          if (typeof pos === 'number') {
            editor.commands.setNodeSelection(pos)
            
            // Trigger custom selection update
            setTimeout(() => {
              const event = new CustomEvent('imageSelected', { detail: { node, pos } })
              editor.view.dom.dispatchEvent(event)
            }, 0)
          }
        }
      })
      
      return {
        dom: img,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false
          
          // Update image attributes
          if (updatedNode.attrs.src !== node.attrs.src) {
            img.src = updatedNode.attrs.src
          }
          if (updatedNode.attrs.width !== node.attrs.width) {
            img.style.width = updatedNode.attrs.width ? `${updatedNode.attrs.width}px` : 'auto'
          }
          if (updatedNode.attrs.float !== node.attrs.float) {
            img.style.float = updatedNode.attrs.float || 'none'
            img.style.margin = updatedNode.attrs.float === 'left' ? '0 16px 16px 0' : 
                              updatedNode.attrs.float === 'right' ? '0 0 16px 16px' : '0'
          }
          
          return true
        }
      }
    }
  }
})

// FigureGroup Extension - Group image and caption as one block
const FigureGroup = Node.create({
  name: 'figureGroup',
  group: 'block',
  content: 'block+', // Allow any block content (more flexible than 'image captionBox')
  addAttributes() {
    return {
      width: {
        default: null,
        parseHTML: element => {
          const width = element.style.width
          return width ? Number.parseInt(width) : null
        },
        renderHTML: attributes => {
          if (!attributes.width) return {}
          return { style: `width: ${attributes.width}px` }
        },
      },
      float: {
        default: 'none',
        parseHTML: element => {
          return element.style.float || element.getAttribute('data-float') || 'none'
        },
        renderHTML: attributes => {
          const float = attributes.float || 'none'
          const styles: string[] = []
          
          // Add width if present
          if (attributes.width) {
            styles.push(`width: ${attributes.width}px`)
          }
          
          // Add float and margin
          if (float !== 'none') {
            styles.push(`float: ${float}`)
            if (float === 'left') {
              styles.push('margin: 0 16px 16px 0')
            } else if (float === 'right') {
              styles.push('margin: 0 0 16px 16px')
            }
          }
          
          return {
            'data-float': float,
            ...(styles.length > 0 ? { style: styles.join('; ') } : {})
          }
        },
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div.figure-group' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, class: 'figure-group' }, 0]
  },
})

// Font options
const fontFamilies = [
  'Peter Test', 'Arial', 'Georgia', 'Times New Roman', 'Helvetica', 'Verdana', 
  'Courier New', 'Tahoma', 'Comic Sans MS', 'Impact', 'Trebuchet MS'
]

// Font sizes
const fontSizes = [
  '8px', '9px', '10px', '11px', '12px', '14px', '16px', '18px', 
  '20px', '24px', '28px', '32px', '36px', '48px', '72px'
]

// Color options
const colorOptions = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#a61e4d', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'
]

const CKEditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [selectedImage, setSelectedImage] = React.useState<{ attrs: { float?: string; width?: number } } | null>(null)
  const [isInTable, setIsInTable] = React.useState(false)
  const [showImageModal, setShowImageModal] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState('')
  const [dragActive, setDragActive] = React.useState(false)
  const [canMerge, setCanMerge] = React.useState(false)
  const [canSplit, setCanSplit] = React.useState(false)
  const [showBorderMenu, setShowBorderMenu] = React.useState(false)
  const [currentBorderClass, setCurrentBorderClass] = React.useState('')
  const [showCaptionPrompt, setShowCaptionPrompt] = React.useState(false)
  const [pendingImageUrl, setPendingImageUrl] = React.useState('')
  
  React.useEffect(() => {
    const handleSelectionUpdate = () => {
      if (!editor) return
      
      // Check for selected image - multiple approaches for better detection
      let imageNode = null
      
      // Method 1: Check if current selection is an image node
      const { from, to } = editor.state.selection
      const selection = editor.state.selection as { node?: { type: { name: string } } } // Type assertion for node access
      if (selection.node && selection.node.type.name === 'image') {
        imageNode = selection.node
      }
      
      // Method 2: Check at selection start position
      if (!imageNode) {
        const nodeAtFrom = editor.state.doc.nodeAt(from)
        if (nodeAtFrom && nodeAtFrom.type.name === 'image') {
          imageNode = nodeAtFrom
        }
      }
      
      // Method 3: Check if we're inside an image (for single-click selection)
      if (!imageNode && from === to) {
        const resolvedFrom = editor.state.doc.resolve(from)
        const parent = resolvedFrom.parent
        if (parent && parent.type.name === 'image') {
          imageNode = parent
        }
        
        // Check surrounding positions
        if (!imageNode && from > 0) {
          const beforeNode = editor.state.doc.nodeAt(from - 1)
          if (beforeNode && beforeNode.type.name === 'image') {
            imageNode = beforeNode
          }
        }
      }
      
      // Method 4: Use TipTap's isActive method as fallback
      if (!imageNode && editor.isActive('image')) {
        // Find the image node in the current selection range
        editor.state.doc.nodesBetween(from, to, (node) => {
          if (node.type.name === 'image') {
            imageNode = node
            return false // stop iteration
          }
        })
      }
      
      if (imageNode) {
        setSelectedImage(imageNode as { attrs: { float?: string; width?: number } })
      } else {
        setSelectedImage(null)
      }
      
      // Check if cursor is in a table
      const inTable = editor.isActive('table')
      setIsInTable(inTable)
      
      // Update current border class when in table
      if (inTable) {
        const { selection } = editor.state
        const tableNode = findParentNode((node) => node.type.name === 'table')(selection)
        setCurrentBorderClass(tableNode?.node.attrs.class || '')
      }
      
      // Update merge/split button states
      if (inTable) {
        setCanMerge(editor.can().mergeCells())
        setCanSplit(editor.can().splitCell())
      } else {
        setCanMerge(false)
        setCanSplit(false)
      }
    }

    const handleForceUpdate = () => {
      handleSelectionUpdate()
    }

    const handleImageSelected = (event: CustomEvent) => {
      const { node } = event.detail
      if (node && node.type.name === 'image') {
        setSelectedImage(node as { attrs: { float?: string; width?: number } })
      }
    }

    if (editor) {
      editor.on('selectionUpdate', handleSelectionUpdate)
      
      // Also listen to focus events for better responsiveness
      editor.on('focus', handleSelectionUpdate)
      
      // Listen for transaction updates (when content changes)
      editor.on('update', handleSelectionUpdate)
      
      // Listen for our custom events
      editor.view.dom.addEventListener('forceSelectionUpdate', handleForceUpdate)
      editor.view.dom.addEventListener('imageSelected', handleImageSelected as EventListener)
      
      return () => {
        editor.off('selectionUpdate', handleSelectionUpdate)
        editor.off('focus', handleSelectionUpdate)
        editor.off('update', handleSelectionUpdate)
        editor.view.dom.removeEventListener('forceSelectionUpdate', handleForceUpdate)
        editor.view.dom.removeEventListener('imageSelected', handleImageSelected as EventListener)
      }
    }
  }, [editor])
  
  // Close border menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showBorderMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.toolbar-group')) {
          setShowBorderMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBorderMenu])
  
  if (!editor) return null

  const insertImage = () => {
    setShowImageModal(true)
  }

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (response.ok && result.url) {
        // Store the image URL and show caption prompt
        setPendingImageUrl(result.url)
        setShowImageModal(false)
        setShowCaptionPrompt(true)
        toast.success('Image uploaded successfully!')
      } else {
        throw new Error(result.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }

  const handleImageUrl = () => {
    if (imageUrl.trim()) {
      // Store the image URL and show caption prompt
      setPendingImageUrl(imageUrl.trim())
      setShowImageModal(false)
      setImageUrl('')
      setShowCaptionPrompt(true)
    }
  }
  
  const insertImageWithCaption = (addCaption: boolean) => {
    if (!pendingImageUrl || !editor) return

    if (addCaption) {
      setTimeout(() => {
        if (!editor) return
        // Use default width and float for new image
        const imageWidth = 300
        const imageFloat = 'none'
        const { doc } = editor.state
        const endPos = doc.content.size - 1
        editor.chain().focus().setTextSelection(endPos)
          .insertContent({
            type: 'figureGroup',
            attrs: { width: imageWidth, float: imageFloat },
            content: [
              { type: 'image', attrs: { src: pendingImageUrl, width: imageWidth, float: imageFloat } },
              { type: 'captionBox', attrs: { width: imageWidth, float: imageFloat }, content: [{ type: 'text', text: 'Type your caption here...' }] }
            ]
          })
          .run()
      }, 100)
    } else {
      // Only image
      editor.chain().focus().setImage({ src: pendingImageUrl }).run()
    }
    setPendingImageUrl('')
    setShowCaptionPrompt(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }

  const insertLink = () => {
    const url = globalThis.prompt('Enter URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  // Table manipulation functions
  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run()
  }

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run()
  }

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run()
  }

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run()
  }

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run()
  }

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run()
  }

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run()
  }

  const toggleHeaderColumn = () => {
    editor.chain().focus().toggleHeaderColumn().run()
  }

  const toggleHeaderRow = () => {
    editor.chain().focus().toggleHeaderRow().run()
  }

  const mergeCells = () => {
    if (editor?.can().mergeCells()) {
      editor.chain().focus().mergeCells().run()
    }
  }

  const splitCell = () => {
    if (editor?.can().splitCell()) {
      editor.chain().focus().splitCell().run()
    }
  }

  const setImageFloat = (float: string) => {
    if (!editor) return
    
    // Check if image is inside a figureGroup
    const { state } = editor
    const { selection } = state
    const { $from } = selection
    
    // Try to find parent figureGroup
    let figureGroupDepth = -1
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'figureGroup') {
        figureGroupDepth = d
        break
      }
    }
    
    if (figureGroupDepth > -1) {
      // Update figureGroup's float attribute
      const pos = $from.before(figureGroupDepth)
      editor.chain()
        .focus()
        .setNodeSelection(pos)
        .updateAttributes('figureGroup', { float })
        .run()
    } else {
      // Update image's float attribute
      editor.chain().focus().updateAttributes('image', { float }).run()
    }
  }

  const setImageWidth = (width: number) => {
    if (!editor) return
    
    // Check if image is inside a figureGroup
    const { state } = editor
    const { selection } = state
    const { $from } = selection
    
    // Try to find parent figureGroup
    let figureGroupDepth = -1
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === 'figureGroup') {
        figureGroupDepth = d
        break
      }
    }
    
    if (figureGroupDepth > -1) {
      // Update both figureGroup and image width
      const pos = $from.before(figureGroupDepth)
      editor.chain()
        .focus()
        .setNodeSelection(pos)
        .updateAttributes('figureGroup', { width })
        .run()
      // Also update the image inside
      editor.chain().focus().updateAttributes('image', { width }).run()
    } else {
      // Update image's width attribute
      editor.chain().focus().updateAttributes('image', { width }).run()
    }
  }

  const getCurrentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1'
    if (editor.isActive('heading', { level: 2 })) return 'h2'
    if (editor.isActive('heading', { level: 3 })) return 'h3'
    if (editor.isActive('heading', { level: 4 })) return 'h4'
    if (editor.isActive('heading', { level: 5 })) return 'h5'
    if (editor.isActive('heading', { level: 6 })) return 'h6'
    return 'p'
  }

  return (
    <div className="ckeditor-toolbar">
      {/* Primary Toolbar Row */}
      <div className="toolbar-row primary">
        <ToolbarGroup className="toolbar-group">
          <Button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
            className="tool-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
            className="tool-btn"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>
            </svg>
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup className="toolbar-group">
                    <select
            value={getCurrentHeading()}
            onChange={(e) => {
              const level = e.target.value
              if (level === 'p') {
                editor.chain().focus().setParagraph().run()
              } else {
                const headingLevel = Number.parseInt(level.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
                editor.chain().focus().toggleHeading({ level: headingLevel }).run()
              }
            }}
            className="style-select"
            title="Format"
          >
            <option value="p">Normal</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>

          <select
            onChange={(e) => {
              if (e.target.value) {
                editor.chain().focus().setFontFamily(e.target.value).run()
              } else {
                editor.chain().focus().unsetFontFamily().run()
              }
            }}
            className="font-select"
            title="Font Family"
          >
            <option value="">Default Font (Peter Test)</option>
            {fontFamilies.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          <select
            onChange={(e) => {
              if (e.target.value) {
                editor.chain().focus().setFontSize(e.target.value).run()
              } else {
                editor.chain().focus().unsetFontSize().run()
              }
            }}
            className="size-select"
            title="Font Size"
            value={editor.getAttributes('textStyle').fontSize || ''}
          >
            <option value="">Size</option>
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup className="toolbar-group">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`tool-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`tool-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`tool-btn ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`tool-btn ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
          >
            <s>S</s>
          </Button>

          <div className="color-controls">
            <div className="color-button-group">
              <input
                type="color"
                value={editor.getAttributes('textStyle').color || '#000000'}
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                title="Text Color"
                className="color-input text-color"
              />
              <input
                type="color"
                value={editor.getAttributes('highlight').color || '#ffff00'}
                onChange={(e) => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()}
                title="Highlight Color"
                className="color-input highlight-color"
              />
            </div>
          </div>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup className="toolbar-group">
          <Button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`tool-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align Left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`tool-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`tool-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align Right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`tool-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
            title="Justify"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/>
            </svg>
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup className="toolbar-group">
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tool-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tool-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`tool-btn ${editor.isActive('taskList') ? 'active' : ''}`}
            title="Task List"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c1.57 0 3.04.46 4.28 1.25l1.44-1.44C16.1 2.67 14.13 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6l-.97-1.18C13.74 19.74 12.9 20 12 20z"/>
            </svg>
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup className="toolbar-group">
          <Button
            type="button"
            onClick={insertLink}
            className={`tool-btn ${editor.isActive('link') ? 'active' : ''}`}
            title="Insert Link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={insertImage}
            className="tool-btn"
            title="Insert Image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={() => editor.chain().focus().insertCaptionBox().run()}
            className="tool-btn"
            title="Insert Caption Box"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
            </svg>
          </Button>
          
          <Button
            type="button"
            onClick={insertTable}
            className="tool-btn"
            title="Insert Table"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 19H5v-3h3v3zm0-5H5v-3h3v3zm0-5H5V6h3v3zm6 10h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3V6h3v3zm5 10h-3v-3h3v3zm0-5h-3v-3h3v3zm0-5h-3V6h3v3z"/>
            </svg>
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup className="toolbar-group">
          <Button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`tool-btn ${showAdvanced ? 'active' : ''}`}
            title="More Options"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </Button>
        </ToolbarGroup>
      </div>

      {/* Image Options Toolbar (shown when image is selected) */}
      {selectedImage && (
        <div className="toolbar-row image-options">
          <div className="image-controls">
            <label>Text Wrapping:</label>
            <Button
              type="button"
              onClick={() => setImageFloat('none')}
              className={`tool-btn ${selectedImage.attrs.float === 'none' ? 'active' : ''}`}
              title="No wrap"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 3H3v18h18V3zm-2 16H5V5h14v14z"/>
              </svg>
            </Button>
            <Button
              type="button"
              onClick={() => setImageFloat('left')}
              className={`tool-btn ${selectedImage.attrs.float === 'left' ? 'active' : ''}`}
              title="Wrap text right"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5h6v6H3V5zm8 0h10v2H11V5zm0 4h10v2H11V9zm-8 4h6v6H3v-6zm8 0h10v2H11v-2zm0 4h10v-2H11v-2z"/>
              </svg>
            </Button>
            <Button
              type="button"
              onClick={() => setImageFloat('right')}
              className={`tool-btn ${selectedImage.attrs.float === 'right' ? 'active' : ''}`}
              title="Wrap text left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 5h6v6h-6V5zM3 5h10v2H3V5zm0 4h10v2H3V9zm12 4h6v6h-6v-6zM3 13h10v2H3v-2zm0 4h10v2H3v-2z"/>
              </svg>
            </Button>
            
            <label>Size:</label>
            <input
              type="range"
              min="100"
              max="800"
              value={selectedImage.attrs.width || 300}
              onChange={(e) => setImageWidth(parseInt(e.target.value))}
              className="size-slider"
            />
            <span>{selectedImage.attrs.width || 300}px</span>
          </div>
        </div>
      )}

      {/* Table Options Toolbar (shown when cursor is in table) */}
      {isInTable && (
        <div className="toolbar-row table-options">
          <div className="table-help-text">
            💡 <strong>To merge cells:</strong> Click inside a cell and drag to adjacent cells, then click Merge
          </div>
          <div className="table-controls">
            <ToolbarGroup className="toolbar-group">
              <label>Columns:</label>
              <Button
                type="button"
                onClick={addColumnBefore}
                className="tool-btn"
                title="Add Column Before"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,2A2,2 0 0,1 15,4V20A2,2 0 0,1 13,22H11A2,2 0 0,1 9,20V4A2,2 0 0,1 11,2H13M13,4H11V20H13V4M7,11H5V9H3V11H1V13H3V15H5V13H7V11Z"/>
                </svg>
              </Button>
              <Button
                type="button"
                onClick={addColumnAfter}
                className="tool-btn"
                title="Add Column After"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11,2A2,2 0 0,1 13,4V20A2,2 0 0,1 11,22H9A2,2 0 0,1 7,20V4A2,2 0 0,1 9,2H11M11,4H9V20H11V4M17,11H19V9H21V11H23V13H21V15H19V13H17V11Z"/>
                </svg>
              </Button>
              <Button
                type="button"
                onClick={deleteColumn}
                className="tool-btn"
                title="Delete Column"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,2A2,2 0 0,1 15,4V20A2,2 0 0,1 13,22H11A2,2 0 0,1 9,20V4A2,2 0 0,1 11,2H13M13,4H11V20H13V4M7.5,17L9,15.5L7.5,14L6,15.5L7.5,17M1.5,17L3,15.5L1.5,14L0,15.5L1.5,17Z"/>
                </svg>
              </Button>
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup className="toolbar-group">
              <label>Rows:</label>
              <Button
                type="button"
                onClick={addRowBefore}
                className="tool-btn"
                title="Add Row Before"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22,13A2,2 0 0,1 20,15H4A2,2 0 0,1 2,13V11A2,2 0 0,1 4,9H20A2,2 0 0,1 22,11V13M20,13V11H4V13H20M11,7H9V5H11V3H13V5H15V7H13V9H11V7Z"/>
                </svg>
              </Button>
              <Button
                type="button"
                onClick={addRowAfter}
                className="tool-btn"
                title="Add Row After"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2,11A2,2 0 0,1 4,9H20A2,2 0 0,1 22,11V13A2,2 0 0,1 20,15H4A2,2 0 0,1 2,13V11M4,11V13H20V11H4M11,17H9V19H11V21H13V19H15V17H13V15H11V17Z"/>
                </svg>
              </Button>
              <Button
                type="button"
                onClick={deleteRow}
                className="tool-btn"
                title="Delete Row"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22,13A2,2 0 0,1 20,15H4A2,2 0 0,1 2,13V11A2,2 0 0,1 4,9H20A2,2 0 0,1 22,11V13M17,7.5L15.5,9L17,10.5L18.5,9L17,7.5M10.5,7.5L9,9L10.5,10.5L12,9L10.5,7.5Z"/>
                </svg>
              </Button>
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup className="toolbar-group">
              <label>Headers:</label>
              <Button
                type="button"
                onClick={toggleHeaderRow}
                className="tool-btn"
                title="Toggle Header Row - Converts first row to/from header cells"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5,4H19A2,2 0 0,1 21,6V18A2,2 0 0,1 19,20H5A2,2 0 0,1 3,18V6A2,2 0 0,1 5,4M5,8V12H11V8H5M13,8V12H19V8H13M5,14V18H11V14H5M13,14V18H19V14H13Z"/>
                </svg>
              </Button>
              <Button
                type="button"
                onClick={toggleHeaderColumn}
                className="tool-btn"
                title="Toggle Header Column - Converts first column to/from header cells"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4,5H20A2,2 0 0,1 22,7V17A2,2 0 0,1 20,19H4A2,2 0 0,1 2,17V7A2,2 0 0,1 4,5M4,7V11H8V7H4M10,7V11H20V7H10M4,13V17H8V13H4M10,13V17H20V13H10Z"/>
                </svg>
              </Button>
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup className="toolbar-group">
              <label>Cells:</label>
              <Button
                type="button"
                onClick={mergeCells}
                className={`tool-btn ${canMerge ? 'can-merge' : ''}`}
                title="Merge Cells - Click inside a cell and drag to adjacent cells to select them, then click this button"
                disabled={!canMerge}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6H22V18H19V16H21V8H19V6M3,6V8H5V16H3V18H6V6H3M9,6V18H15V6H9M11,8H13V16H11V8Z"/>
                </svg>
              </Button>
              <Button
                type="button"
                onClick={splitCell}
                className={`tool-btn ${canSplit ? 'can-split' : ''}`}
                title="Split Cell - Click inside a merged cell to split it back into individual cells"
                disabled={!canSplit}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6H22V18H19V16H21V8H19V6M3,6V8H5V16H3V18H6V6H3M7,6V18H9V14H11V18H13V6H11V10H9V6H7Z"/>
                </svg>
              </Button>
              <Button
                type="button"
                onClick={deleteTable}
                className="tool-btn delete-table"
                title="Delete Table"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V7H5V5H19M5,9H11V15H5V9M5,19V17H11V19H5M19,19H13V17H19V19M19,15H13V9H19V15Z"/>
                  <path d="M14.59,8L12,10.59L9.41,8L8,9.41L10.59,12L8,14.59L9.41,16L12,13.41L14.59,16L16,14.59L13.41,12L16,9.41L14.59,8Z"/>
                </svg>
              </Button>
            </ToolbarGroup>

            <ToolbarSeparator />

            <ToolbarGroup className="toolbar-group">
              <label>Borders:</label>
              <div style={{ position: 'relative' }}>
                <Button
                  type="button"
                  onClick={() => setShowBorderMenu(!showBorderMenu)}
                  className="tool-btn"
                  title="Table Border Options"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,3V21H21V3H3M19,5V7H17V5H19M15,5V7H13V5H15M11,5V7H9V5H11M7,5V7H5V5H7M5,9H7V11H5V9M5,13H7V15H5V13M5,17H7V19H5V17M9,19V17H11V19H9M13,19V17H15V19H13M17,19V17H19V19H17M19,15H17V13H19V15M19,11H17V9H19V11Z"/>
                  </svg>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}>
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </Button>
                
                {showBorderMenu && (() => {
                  return (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    backgroundColor: '#2d2d2d',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 1000,
                    minWidth: '200px',
                    marginTop: '4px'
                  }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editor) return
                        const { selection } = editor.state
                        const tableNode = findParentNode((node) => node.type.name === 'table')(selection)
                        if (tableNode) {
                          editor.commands.updateAttributes('table', { class: '' })
                          setCurrentBorderClass('')
                        }
                        setShowBorderMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: currentBorderClass === '' ? '#444' : 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentBorderClass === '' ? '#444' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,3V21H21V3H3M19,19H5V5H19V19Z"/>
                        </svg>
                        All Borders
                      </div>
                      {currentBorderClass === '' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4ade80">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (!editor) return
                        const { selection } = editor.state
                        const tableNode = findParentNode((node) => node.type.name === 'table')(selection)
                        if (tableNode) {
                          editor.commands.updateAttributes('table', { class: 'borderless' })
                          setCurrentBorderClass('borderless')
                        }
                        setShowBorderMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: currentBorderClass === 'borderless' ? '#444' : 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentBorderClass === 'borderless' ? '#444' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,3V21H21V3H3Z"/>
                        </svg>
                        No Border
                      </div>
                      {currentBorderClass === 'borderless' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4ade80">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (!editor) return
                        const { selection } = editor.state
                        const tableNode = findParentNode((node) => node.type.name === 'table')(selection)
                        if (tableNode) {
                          editor.commands.updateAttributes('table', { class: 'border-outside' })
                          setCurrentBorderClass('border-outside')
                        }
                        setShowBorderMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: currentBorderClass === 'border-outside' ? '#444' : 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentBorderClass === 'border-outside' ? '#444' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,3V21H21V3H3M19,5H5V19H19V5Z"/>
                        </svg>
                        Outside Borders
                      </div>
                      {currentBorderClass === 'border-outside' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4ade80">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (!editor) return
                        const { selection } = editor.state
                        const tableNode = findParentNode((node) => node.type.name === 'table')(selection)
                        if (tableNode) {
                          editor.commands.updateAttributes('table', { class: 'border-inside' })
                          setCurrentBorderClass('border-inside')
                        }
                        setShowBorderMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: currentBorderClass === 'border-inside' ? '#444' : 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentBorderClass === 'border-inside' ? '#444' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9,9V15H15V9M11,11H13V13H11V11M3,3V21H21V3M19,19H5V5H19"/>
                        </svg>
                        Inside Borders
                      </div>
                      {currentBorderClass === 'border-inside' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4ade80">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        if (!editor) return
                        const { selection } = editor.state
                        const tableNode = findParentNode((node) => node.type.name === 'table')(selection)
                        if (tableNode) {
                          editor.commands.updateAttributes('table', { class: 'border-horizontal' })
                          setCurrentBorderClass('border-horizontal')
                        }
                        setShowBorderMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: currentBorderClass === 'border-horizontal' ? '#444' : 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#444'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = currentBorderClass === 'border-horizontal' ? '#444' : 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3,3V21H21V3M19,9H5V7H19M19,15H5V13H19M19,19H5V17H19"/>
                        </svg>
                        Horizontal Lines
                      </div>
                      {currentBorderClass === 'border-horizontal' && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4ade80">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  )
                })()}
              </div>
            </ToolbarGroup>
          </div>
        </div>
      )}

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="toolbar-row advanced">
          <ToolbarGroup className="toolbar-group">
            <Button
              type="button"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={`tool-btn ${editor.isActive('subscript') ? 'active' : ''}`}
              title="Subscript"
            >
              X₂
            </Button>
            
            <Button
              type="button"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={`tool-btn ${editor.isActive('superscript') ? 'active' : ''}`}
              title="Superscript"
            >
              X²
            </Button>
            
            <Button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={`tool-btn ${editor.isActive('code') ? 'active' : ''}`}
              title="Inline Code"
            >
              &lt;/&gt;
            </Button>
            
            <Button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`tool-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
              title="Code Block"
            >
              { }
            </Button>
            
            <Button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="tool-btn"
              title="Horizontal Rule"
            >
              ―
            </Button>
            
            <Button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`tool-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
              title="Quote"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
              </svg>
            </Button>
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup className="toolbar-group">
            <div className="color-palette">
              <label>Colors:</label>
              <div className="color-grid">
                {colorOptions.slice(0, 20).map(color => (
                  <button
                    key={color}
                    className="color-swatch"
                    style={{ backgroundColor: color }}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </ToolbarGroup>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Insert Image</h3>
              <button 
                type="button"
                className="modal-close"
                onClick={() => setShowImageModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {/* Drag and Drop Area */}
              <div 
                className={`drag-drop-area ${dragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="drag-drop-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <p>Drag and drop an image here</p>
                  <p className="or-text">or</p>
                  <label className="file-input-button">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />
                    Choose File
                  </label>
                </div>
              </div>
              
              {/* URL Input */}
              <div className="url-input-section">
                <label htmlFor="image-url">Or enter image URL:</label>
                <div className="url-input-group">
                  <input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleImageUrl()
                      }
                    }}
                  />
                  <button 
                    type="button"
                    className="url-submit-btn"
                    onClick={handleImageUrl}
                    disabled={!imageUrl.trim()}
                  >
                    Insert
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Caption Prompt Modal */}
      {showCaptionPrompt && (
        <div className="image-modal-overlay" onClick={() => {
          insertImageWithCaption(false)
        }}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Add Image Caption?</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => insertImageWithCaption(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-content">
              <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
                Would you like to add a caption for this image?
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => insertImageWithCaption(false)}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#666',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  No, Skip
                </button>
                <button
                  type="button"
                  onClick={() => insertImageWithCaption(true)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#007acc',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Yes, Add Caption
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const EnhancedEditorCKEditor = ({ 
  value = "", 
  onChange,
  placeholder = "Start writing...",
  className = "",
  height = "400px",
  onEditorReady
}: EnhancedEditorProps) => {
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Color.configure({ types: [TextStyle.name] }),
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      ImageWithWrapping.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CustomTable.configure({
        resizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Typography,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      FigureGroup,
      CaptionBox,
      Placeholder.configure({
        placeholder,
      }),
      Focus.configure({
        className: 'focused',
        mode: 'all',
      }),
      CharacterCount.configure({
        limit: 10000,
      }),
      Dropcursor,
      Gapcursor,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      if (onChange) {
        // Debounce onChange to avoid too many updates
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current)
        }
        debounceTimeoutRef.current = setTimeout(() => {
          onChange(editor.getHTML())
        }, 300) // 300ms delay
      }
    },
    onTransaction: ({ editor, transaction }) => {
      // Force a selection update check on any transaction
      if (transaction.selectionSet || transaction.docChanged) {
        setTimeout(() => {
          // Trigger a manual selection update check
          const event = new CustomEvent('forceSelectionUpdate')
          editor.view.dom.dispatchEvent(event)
        }, 0)
      }
    },
    editorProps: {
      attributes: {
        class: 'ckeditor-content',
      },
      handleKeyDown: (view, event) => {
        // Prevent Ctrl/Cmd+Enter from submitting forms
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.stopPropagation()
        }
        // Let TipTap handle the event normally
        return false
      },
    },
  })

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "")
    }
  }, [value, editor])

  // Pass editor instance to parent when ready
  React.useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor)
    }
  }, [editor, onEditorReady])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    const timeoutRef = debounceTimeoutRef
    return () => {
      const timeoutId = timeoutRef.current
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <div className={`ckeditor-editor ${className}`} style={{ height }}>
      <CKEditorToolbar editor={editor} />
      
      <div className="editor-area">
        <EditorContent editor={editor} />
      </div>
      
      <div className="status-bar">
        <span>
          {editor?.storage.characterCount.characters() || 0} characters, {editor?.storage.characterCount.words() || 0} words
        </span>
        <span>
          Rich Text Editor • 
        </span>
      </div>
    </div>
  )
}

export default EnhancedEditorCKEditor
