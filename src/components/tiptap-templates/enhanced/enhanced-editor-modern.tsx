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
import "./enhanced-editor-modern.scss"

interface EnhancedEditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
  className?: string
  height?: string
}

// Color options
const colorOptions = [
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
]

// Highlight color options
const highlightOptions = [
  '#fef3c7', '#fed7aa', '#fecaca', '#bbf7d0', '#a7f3d0', '#bfdbfe', '#e0e7ff', '#f3e8ff'
]

const ModernToolbar = ({ editor }: { editor: Editor | null }) => {
  const [showColors, setShowColors] = React.useState(false)
  const [showMore, setShowMore] = React.useState(false)
  
  if (!editor) return null

  return (
    <div className="modern-toolbar">
      {/* Main Toolbar */}
      <div className="toolbar-main">
        <ToolbarGroup>
          <Button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
            className="tool-btn"
          >
            ↶
          </Button>
          <Button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
            className="tool-btn"
          >
            ↷
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <select
            value={
              editor.isActive('heading', { level: 1 }) ? 'h1' :
              editor.isActive('heading', { level: 2 }) ? 'h2' :
              editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
            }
            onChange={(e) => {
              const level = e.target.value
              if (level === 'p') {
                editor.chain().focus().setParagraph().run()
              } else {
                const headingLevel = parseInt(level.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
                editor.chain().focus().toggleHeading({ level: headingLevel }).run()
              }
            }}
            className="style-select"
          >
            <option value="p">Text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <Button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`tool-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Bold"
          >
            <strong>B</strong>
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`tool-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Italic"
          >
            <em>I</em>
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`tool-btn ${editor.isActive('underline') ? 'active' : ''}`}
            title="Underline"
          >
            <u>U</u>
          </Button>
          
          <Button
            onClick={() => setShowColors(!showColors)}
            className={`tool-btn ${showColors ? 'active' : ''}`}
            title="Text Color"
          >
            A
          </Button>
          
          <Button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`tool-btn ${editor.isActive('highlight') ? 'active' : ''}`}
            title="Highlight"
          >
            ⬜
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <Button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`tool-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Bullet List"
          >
            ●
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`tool-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Numbered List"
          >
            1.
          </Button>
          <Button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`tool-btn ${editor.isActive('taskList') ? 'active' : ''}`}
            title="Checklist"
          >
            ☐
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <Button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`tool-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Align Left"
          >
            ⬅
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`tool-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Align Center"
          >
            ⬌
          </Button>
          <Button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`tool-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Align Right"
          >
            ➡
          </Button>
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <Button
            onClick={() => {
              const url = window.prompt('Enter URL:')
              if (url) {
                editor.chain().focus().setLink({ href: url }).run()
              }
            }}
            className={`tool-btn ${editor.isActive('link') ? 'active' : ''}`}
            title="Add Link"
          >
            🔗
          </Button>

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
            className="tool-btn"
            title="Add Image"
          >
            🖼
          </Button>

          <Button
            onClick={() => setShowMore(!showMore)}
            className={`tool-btn ${showMore ? 'active' : ''}`}
            title="More"
          >
            ⋯
          </Button>
        </ToolbarGroup>
      </div>

      {/* Color Picker */}
      {showColors && (
        <div className="color-picker">
          <div className="color-section">
            <span className="label">Text</span>
            <div className="color-list">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run()
                    setShowColors(false)
                  }}
                  className="color-item"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
          <div className="color-section">
            <span className="label">Highlight</span>
            <div className="color-list">
              {highlightOptions.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setHighlight({ color }).run()
                    setShowColors(false)
                  }}
                  className="color-item"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <button
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  setShowColors(false)
                }}
                className="color-item clear"
                title="Remove highlight"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* More Options */}
      {showMore && (
        <div className="more-options">
          <ToolbarGroup>
            <Button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`tool-btn ${editor.isActive('strike') ? 'active' : ''}`}
              title="Strikethrough"
            >
              <s>S</s>
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={`tool-btn ${editor.isActive('superscript') ? 'active' : ''}`}
              title="Superscript"
            >
              X²
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={`tool-btn ${editor.isActive('subscript') ? 'active' : ''}`}
              title="Subscript"
            >
              X₂
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`tool-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
              title="Quote"
            >
              💬
            </Button>
            <Button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`tool-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
              title="Code"
            >
              💻
            </Button>
            <Button
              onClick={() => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
              }}
              className="tool-btn"
              title="Table"
            >
              📊
            </Button>
            <Button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="tool-btn"
              title="Divider"
            >
              ➖
            </Button>
          </ToolbarGroup>
        </div>
      )}
    </div>
  )
}

const StatusBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null

  const characters = editor.storage.characterCount.characters()
  const words = editor.storage.characterCount.words()

  return (
    <div className="status-bar">
      <span>{words} words</span>
      <span>{characters} characters</span>
    </div>
  )
}

export function EnhancedEditor({ 
  value = '', 
  onChange,
  placeholder = 'Start writing...',
  className = '',
  height: containerHeight = '500px'
}: EnhancedEditorProps = {}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "modern-editor-content",
        spellcheck: "true",
      },
    },
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Focus.configure({
        className: 'focused',
        mode: 'all',
      }),
      CharacterCount,
      Dropcursor.configure({
        color: '#3b82f6',
        width: 2,
      }),
      Gapcursor,
      TextAlign.configure({ 
        types: ["heading", "paragraph"],
      }),
      TaskList,
      TaskItem.configure({ 
        nested: true,
      }),
      Highlight.configure({ 
        multicolor: true,
      }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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
    <div className={`modern-editor ${className}`} style={{ height: containerHeight }}>
      <EditorContext.Provider value={editorContextValue}>
        <ModernToolbar editor={editor} />
        
        <div className="editor-area">
          <EditorContent editor={editor} />
        </div>
        
        <StatusBar editor={editor} />
      </EditorContext.Provider>
    </div>
  )
}
