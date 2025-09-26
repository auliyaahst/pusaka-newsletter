'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useRef, useState } from 'react'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlock from '@tiptap/extension-code-block'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxHeight?: string
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md'
  variant?: 'ghost' | 'outline' | 'default'
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  title, 
  children, 
  size = 'sm',
  variant = 'ghost'
}: ToolbarButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-0"
  
  const sizeClasses = {
    sm: "h-8 min-w-[2rem] px-2 text-sm",
    md: "h-9 min-w-[2.25rem] px-3 text-sm"
  }
  
  const variantClasses = {
    ghost: isActive 
      ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
    outline: isActive
      ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
      : "border border-gray-200 text-gray-700 hover:bg-gray-50",
    default: isActive
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "text-gray-700 hover:bg-gray-100"
  }
  
  const disabledClasses = disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "cursor-pointer"
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses}`}
    >
      {children}
    </button>
  )
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing your article...", 
  maxHeight = "600px" 
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4 shadow-sm',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline decoration-blue-600/30 underline-offset-2 transition-colors hover:text-blue-800 hover:decoration-blue-800/40',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'relative rounded-lg bg-gray-100 p-4 font-mono text-sm my-4 overflow-x-auto',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 bg-gray-50 pl-4 py-2 my-4 italic text-gray-700',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-8 border-gray-200',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      Typography,
      CharacterCount,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none p-6 min-h-[200px]',
        spellcheck: 'false',
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

  if (!editor) {
    return (
      <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-3 border-b border-gray-200 bg-gray-50/50">
        
        {/* Text Formatting */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (⌘+B)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" fill="currentColor"/>
              <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" fill="currentColor"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (⌘+I)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="19" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="2"/>
              <line x1="14" y1="20" x2="5" y2="20" stroke="currentColor" strokeWidth="2"/>
              <line x1="15" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (⌘+U)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="m16 4 2 2-4 4-4-4 2-2z" fill="currentColor"/>
              <path d="M12 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Headings Dropdown */}
        <div className="flex items-center">
          <select
            className="h-8 px-2 text-sm bg-transparent border-none focus:outline-none cursor-pointer text-gray-700 font-medium"
            value={
              editor.isActive('heading', { level: 1 }) ? 'h1' :
              editor.isActive('heading', { level: 2 }) ? 'h2' :
              editor.isActive('heading', { level: 3 }) ? 'h3' :
              'paragraph'
            }
            onChange={(e) => {
              const value = e.target.value
              if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run()
              } else {
                const level = parseInt(value.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
                editor.chain().focus().toggleHeading({ level }).run()
              }
            }}
          >
            <option value="paragraph">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Lists */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="6" cy="12" r="1" fill="currentColor"/>
              <circle cx="6" cy="6" r="1" fill="currentColor"/>
              <circle cx="6" cy="18" r="1" fill="currentColor"/>
              <line x1="10" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered List"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="10" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="10" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
              <path d="M4 6h1v4" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M4 10h2" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-1-1.5" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive('taskList')}
            title="Task List"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="m5 8 2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
              <line x1="13" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2"/>
              <line x1="13" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="13" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Text Alignment */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="21" y1="10" x2="3" y2="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="21" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="14" x2="3" y2="14" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="18" x2="3" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="18" y1="10" x2="6" y2="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="21" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="16" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="2"/>
              <line x1="19" y1="18" x2="5" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="21" y1="10" x2="3" y2="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="21" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="2"/>
              <line x1="21" y1="14" x2="8" y2="14" stroke="currentColor" strokeWidth="2"/>
              <line x1="21" y1="18" x2="8" y2="18" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Quote & Code */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor"/>
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="Code Block"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </ToolbarButton>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Media & Links */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={addImageFromFile}
            disabled={isUploading}
            title="Add Image"
          >
            {isUploading ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            )}
          </ToolbarButton>
          
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            title="Add Link (⌘+K)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </ToolbarButton>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo (⌘+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 7v6h6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </ToolbarButton>
          
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo (⌘+Shift+Z)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 7v6h-6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </ToolbarButton>
        </div>
      </div>

      {/* Editor Content */}
      <div 
        className="overflow-y-auto bg-white"
        style={{ maxHeight }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Status Footer */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          {editor.storage.characterCount && (
            <>
              <span>{editor.storage.characterCount.characters()} characters</span>
              <span>•</span>
              <span>{editor.storage.characterCount.words()} words</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>Type <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">**</kbd> for bold or <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs font-mono">⌘+B</kbd></span>
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
