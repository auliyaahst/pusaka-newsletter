import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import CodeBlock from '@tiptap/extension-code-block'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import ListItem from '@tiptap/extension-list-item'
import Placeholder from '@tiptap/extension-placeholder'
import React, { useRef, useState, useCallback } from 'react'

interface RichTextEditorProps {
  readonly value: string
  readonly onChange: (content: string) => void
  readonly placeholder?: string
  readonly className?: string
  readonly maxHeight?: string
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  title, 
  children,
  variant = 'default'
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
  variant?: 'default' | 'color' | 'danger'
}) => {
  let buttonClasses = 'px-3 py-2 rounded-md text-sm font-medium border transition-all duration-200 flex items-center gap-1 min-w-[40px] justify-center'
  
  if (variant === 'color' && isActive) {
    buttonClasses += ' bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-md'
  } else if (variant === 'danger' && isActive) {
    buttonClasses += ' bg-red-100 text-red-700 border-red-300'
  } else if (isActive) {
    buttonClasses += ' bg-blue-100 text-blue-700 border-blue-300 shadow-sm'
  } else {
    buttonClasses += ' bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
  }
  
  if (disabled) {
    buttonClasses += ' opacity-50 cursor-not-allowed'
  } else {
    buttonClasses += ' hover:shadow-sm transform hover:scale-105'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={buttonClasses}
    >
      {children}
    </button>
  )
}

const ColorPicker = ({ 
  currentColor, 
  onChange, 
  colors 
}: { 
  currentColor: string
  onChange: (color: string) => void
  colors: string[]
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        title="Text Color"
      >
        <span className="text-sm">A</span>
        <div 
          className="w-4 h-1 rounded" 
          style={{ backgroundColor: currentColor }}
        />
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50">
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onChange(color)
                  setIsOpen(false)
                }}
                className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface EditorChain {
  focus: () => EditorChain;
  insertTable: (options: { rows: number; cols: number; withHeaderRow: boolean }) => EditorChain;
  addColumnBefore: () => EditorChain;
  addColumnAfter: () => EditorChain;
  deleteColumn: () => EditorChain;
  addRowBefore: () => EditorChain;
  addRowAfter: () => EditorChain;
  deleteRow: () => EditorChain;
  deleteTable: () => EditorChain;
  setImage: (options: { src: string; alt?: string }) => EditorChain;
  extendMarkRange: (mark: string) => EditorChain;
  unsetLink: () => EditorChain;
  setLink: (options: { href: string }) => EditorChain;
  run: () => void;
}

interface EditorCan {
  addColumnBefore: () => boolean;
  addColumnAfter: () => boolean;
  deleteColumn: () => boolean;
  addRowBefore: () => boolean;
  addRowAfter: () => boolean;
  deleteRow: () => boolean;
  deleteTable: () => boolean;
}

interface TableMenuProps {
  editor: {
    chain: () => EditorChain;
    can: () => EditorCan;
    getHTML: () => string;
    getAttributes: (attribute: string) => { href?: string };
  };
}

const TableMenu = ({ editor }: TableMenuProps) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="relative">
      <ToolbarButton
        onClick={() => setShowMenu(!showMenu)}
        title="Insert Table"
        isActive={showMenu}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </ToolbarButton>
      
      {showMenu && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50 min-w-[200px]">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm"
            >
              Insert 3×3 Table
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addColumnBefore().run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm"
              disabled={!editor.can().addColumnBefore()}
            >
              Add Column Before
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addColumnAfter().run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm"
              disabled={!editor.can().addColumnAfter()}
            >
              Add Column After
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteColumn().run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm"
              disabled={!editor.can().deleteColumn()}
            >
              Delete Column
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addRowBefore().run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm"
              disabled={!editor.can().addRowBefore()}
            >
              Add Row Before
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().addRowAfter().run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm"
              disabled={!editor.can().addRowAfter()}
            >
              Add Row After
            </button>
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteRow().run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-md text-sm"
              disabled={!editor.can().deleteRow()}
            >
              Delete Row
            </button>
            <hr />
            <button
              type="button"
              onClick={() => {
                editor.chain().focus().deleteTable().run()
                setShowMenu(false)
              }}
              className="w-full text-left px-3 py-2 hover:bg-red-50 rounded-md text-sm text-red-600"
              disabled={!editor.can().deleteTable()}
            >
              Delete Table
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your article...", 
  className = "",
  maxHeight = "600px" 
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentColor, setCurrentColor] = useState('#000000')
  
  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'
  ]

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextStyle,
      Color.configure({
        types: [TextStyle.name, ListItem.name],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'table-auto border-collapse border border-gray-300 my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border border-gray-300',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 bg-gray-50 font-semibold p-2 text-left',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-100 rounded-lg p-4 font-mono text-sm my-4 border',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'border-t-2 border-gray-300 my-6',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Typography,
      CharacterCount,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none p-6 min-h-[400px] ${className}`,
      },
    },
    immediatelyRender: false,
  })

  const addImageFromFile = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && editor) {
      setIsUploading(true)
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        editor.chain().focus().setImage({ src, alt: file.name }).run()
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    }
  }, [editor])

  const addImageFromUrl = useCallback(() => {
    if (!editor) return
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const addLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter URL:', previousUrl || 'https://')

    if (url === null) return

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const setTextColor = useCallback((color: string) => {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
    setCurrentColor(color)
  }, [editor])

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg bg-white">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rich-text-editor border border-gray-300 rounded-lg bg-white shadow-sm">
      {/* Quick Actions Bar - Alternative to FloatingMenu */}
      <div className="bg-blue-50 border-b border-blue-200 p-2">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <span className="font-medium">� Quick tips:</span>
          <span>Select text for formatting options</span>
          <span>•</span>
          <span>Use Ctrl+B for bold, Ctrl+I for italic</span>
          <span>•</span>
          <span>Ctrl+K for links</span>
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Text Formatting */}
          <div className="flex items-center gap-1 mr-4">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <s>S</s>
            </ToolbarButton>
          </div>

          {/* Text Color */}
          <div className="mr-4">
            <ColorPicker
              currentColor={currentColor}
              onChange={setTextColor}
              colors={colors}
            />
          </div>

          {/* Highlight */}
          <div className="mr-4">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
              variant="color"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 5H3m4 6H3m4 6H3m10-2l4-4-4-4" />
              </svg>
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 mr-4">
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
              title="Normal Text"
            >
              P
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              H3
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 mr-4">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              title="Task List"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </ToolbarButton>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 mr-4">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Align Left"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Align Center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M6 16h12" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Align Right"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6H4m16 6H8m12 6H4" />
              </svg>
            </ToolbarButton>
          </div>

          {/* Blockquote & Code */}
          <div className="flex items-center gap-1 mr-4">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 5H3m4 6H3m4 6H3m10-2l4-4-4-4" />
              </svg>
            </ToolbarButton>
          </div>

          {/* Media & Table */}
          <div className="flex items-center gap-1 mr-4">
            <ToolbarButton
              onClick={addImageFromFile}
              disabled={isUploading}
              title="Upload Image"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </ToolbarButton>
            <ToolbarButton
              onClick={addImageFromUrl}
              title="Image from URL"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              🔗
            </ToolbarButton>
            <TableMenu editor={editor} />
          </div>

          {/* Dividers & Undo/Redo */}
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Line"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </ToolbarButton>
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Undo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Redo"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
              </svg>
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div 
        className="overflow-y-auto bg-white"
        style={{ maxHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Status Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {editor.storage.characterCount && (
            <>
              <span>{editor.storage.characterCount.characters()} characters</span>
              <span>{editor.storage.characterCount.words()} words</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span>Press &quot;/&quot; for quick commands</span>
          <span className="text-gray-300">|</span>
          <span>Ctrl+K for link</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}
