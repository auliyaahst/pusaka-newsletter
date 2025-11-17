"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor, Editor } from "@tiptap/react"

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

// --- New Microsoft Word-like Extensions ---
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
import { HardBreak } from "@tiptap/extension-hard-break"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import {
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Hooks & Utils ---
// --- Styles ---
import "./enhanced-editor.scss"

interface EnhancedEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  height?: string
}

// Font options for the dropdown
const fontOptions = [
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Trebuchet MS', label: 'Trebuchet MS' },
  { value: 'Palatino', label: 'Palatino' },
  { value: 'Garamond', label: 'Garamond' },
  { value: 'Book Antiqua', label: 'Book Antiqua' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Impact', label: 'Impact' }
]

// Font size options
const fontSizeOptions = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 44, 48, 54, 60, 66, 72, 80, 88, 96
]

// Color options
const colorOptions = [
  '#000000', '#444444', '#666666', '#999999', '#cccccc', '#eeeeee', '#f3f3f3', '#ffffff',
  '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc',
  '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0',
  '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79',
  '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47',
  '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130'
]

// Highlight color options
const highlightOptions = [
  '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff9900', '#ff0000', '#0000ff', '#800080',
  '#fff2cc', '#d9ead3', '#d0e0e3', '#ead1dc', '#fce5cd', '#f4cccc', '#cfe2f3', '#d9d2e9'
]

const EnhancedToolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  return (
    <div className="enhanced-toolbar">
      {/* First Row - File operations, Undo/Redo, Font */}
      <div className="toolbar-row">
        <ToolbarGroup>
          <Button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
            className="toolbar-btn"
          >
            ↶ Undo
          </Button>
          <Button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Y)"
            className="toolbar-btn"
          >
            ↷ Redo
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          {/* Font Family */}
          <select
            value={editor.getAttributes('textStyle').fontFamily || 'Calibri'}
            onChange={(e) => {
              if (e.target.value === '') {
                editor.chain().focus().unsetFontFamily().run()
              } else {
                editor.chain().focus().setFontFamily(e.target.value).run()
              }
            }}
            className="font-selector"
          >
            {fontOptions.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>

          {/* Font Size */}
          <select
            onChange={(e) => {
              const size = Number.parseInt(e.target.value, 10)
              editor.chain().focus().setMark('textStyle', { fontSize: `${size}pt` }).run()
            }}
            className="size-selector"
            defaultValue="11"
          >
            {fontSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          {/* Text Formatting */}
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
            title="Strikethrough"
          >
            <s>S</s>
          </Button>
        </ToolbarGroup>
      </div>

      {/* Second Row - Colors and Highlighting */}
      <div className="toolbar-row">
        <ToolbarGroup>
          {/* Text Color */}
          <div className="color-picker-group">
            <label>Text Color</label>
            <div className="color-grid">
              {colorOptions.slice(0, 16).map((color) => (
                <Button
                  key={color}
                  onClick={() => editor.chain().focus().setColor(color).run()}
                  className="color-btn"
                  style={{ backgroundColor: color }}
                  title={`Set text color to ${color}`}
                />
              ))}
            </div>
          </div>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          {/* Highlight Color */}
          <div className="color-picker-group">
            <label>Highlight</label>
            <div className="color-grid">
              {highlightOptions.slice(0, 8).map((color) => (
                <Button
                  key={color}
                  onClick={() => editor.chain().focus().setHighlight({ color }).run()}
                  className="color-btn"
                  style={{ backgroundColor: color }}
                  title={`Highlight with ${color}`}
                />
              ))}
              <Button
                onClick={() => editor.chain().focus().unsetHighlight().run()}
                className="color-btn no-highlight"
                title="Remove highlight"
              >
                ✕
              </Button>
            </div>
          </div>
        </ToolbarGroup>
      </div>

      {/* Third Row - Paragraph formatting and alignment */}
      <div className="toolbar-row">
        <ToolbarGroup>
          {/* Heading Levels */}
          <select
            value={
              editor.isActive('heading', { level: 1 }) ? 'h1' :
              editor.isActive('heading', { level: 2 }) ? 'h2' :
              editor.isActive('heading', { level: 3 }) ? 'h3' :
              editor.isActive('heading', { level: 4 }) ? 'h4' :
              editor.isActive('heading', { level: 5 }) ? 'h5' :
              editor.isActive('heading', { level: 6 }) ? 'h6' : 'p'
            }
            onChange={(e) => {
              const level = e.target.value
              if (level === 'p') {
                editor.chain().focus().setParagraph().run()
              } else {
                const headingLevel = Number.parseInt(level.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6
                editor.chain().focus().toggleHeading({ level: headingLevel }).run()
              }
            }}
            className="heading-selector"
          >
            <option value="p">Normal Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
          </select>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          {/* Text Alignment */}
          <Button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align Left (Ctrl+L)"
          >
            ⬅️ Left
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Align Center (Ctrl+E)"
          >
            ⬌ Center
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align Right (Ctrl+R)"
          >
            ➡️ Right
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
            title="Justify (Ctrl+J)"
          >
            ≣ Justify
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          {/* Lists */}
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            • List
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            1. List
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`toolbar-btn ${editor.isActive('taskList') ? 'active' : ''}`}
            title="Task List"
          >
            ☑ Tasks
          </Button>
        </ToolbarGroup>
      </div>

      {/* Fourth Row - Insert objects and special formatting */}
      <div className="toolbar-row">
        <ToolbarGroup>
          {/* Special Formatting */}
          <Button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            className={`toolbar-btn ${editor.isActive('superscript') ? 'active' : ''}`}
            title="Superscript"
          >
            X²
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            className={`toolbar-btn ${editor.isActive('subscript') ? 'active' : ''}`}
            title="Subscript"
          >
            X₂
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Quote"
          >
            💬 Quote
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
            title="Code Block"
          >
            💻 Code
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          {/* Link */}
          <Button
            onClick={() => {
              const url = globalThis.prompt('Enter URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
            title="Insert Link (Ctrl+K)"
          >
            🔗 Link
          </Button>

          {/* Image */}
          <Button
            onClick={() => {
              const url = globalThis.prompt('Enter image URL:')
              if (url) {
                editor.chain().focus().setImage({ src: url }).run()
              }
            }}
            className="toolbar-btn"
            title="Insert Image"
          >
            🖼️ Image
          </Button>

          {/* Upload Image */}
          <Button
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = 'image/*'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)
                  editor.chain().focus().setImage({ src: url }).run()
                }
              }
              input.click()
            }}
            className="toolbar-btn"
            title="Upload Image"
          >
            📁 Upload
          </Button>

          {/* Table */}
          <Button
            onClick={() => {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }}
            className="toolbar-btn"
            title="Insert Table"
          >
            📊 Table
          </Button>

          {/* Horizontal Rule */}
          <Button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="toolbar-btn"
            title="Insert Horizontal Rule"
          >
            ➖ Rule
          </Button>
        </ToolbarGroup>
      </div>
    </div>
  )
}

const StatusBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  const characters = editor.storage.characterCount.characters()
  const words = editor.storage.characterCount.words()

  return (
    <div className="status-bar">
      <div className="status-info">
        <span>Words: {words}</span>
        <span>Characters: {characters}</span>
      </div>
    </div>
  )
}

export function EnhancedEditor({ 
  value = '', 
  onChange,
  placeholder = 'Start writing your document here...',
  className = '',
  height: containerHeight = '600px'
}: EnhancedEditorProps = {}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Enhanced document editor",
        class: "enhanced-editor-content",
        spellcheck: "true",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false, // Custom implementation
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Focus.configure({
        className: 'has-focus',
        mode: 'all',
      }),
      CharacterCount,
      Dropcursor.configure({
        color: '#3b82f6',
        width: 3,
      }),
      Gapcursor,
      HardBreak,
      TextAlign.configure({ 
        types: ["heading", "paragraph"],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      TaskList,
      TaskItem.configure({ 
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Highlight.configure({ 
        multicolor: true,
        HTMLAttributes: {
          class: 'editor-highlight',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Typography,
      Superscript,
      Subscript,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'editor-table',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'editor-table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'editor-table-cell',
        },
      }),
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange?.(html)
    },
  })

  const editorContextValue = React.useMemo(() => ({ editor }), [editor])

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '<p></p>', { emitUpdate: false })
    }
  }, [editor, value])

  return (
    <div className={`enhanced-editor-wrapper ${className}`} style={{ height: containerHeight }}>
      <EditorContext.Provider value={editorContextValue}>
        <EnhancedToolbar editor={editor} />
        
        <div className="editor-content-area">
          <EditorContent editor={editor} />
        </div>
        
        <StatusBar editor={editor} />
      </EditorContext.Provider>
    </div>
  )
}
