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
  variant?: 'default' | 'ghost'
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  title, 
  children, 
  variant = 'default' 
}: ToolbarButtonProps) => {
  let buttonClasses = `
    inline-flex items-center justify-center h-8 px-2 text-sm font-medium 
    rounded-md transition-colors duration-150 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1
  `

  if (disabled) {
    buttonClasses += ' opacity-50 cursor-not-allowed pointer-events-none'
  } else {
    buttonClasses += ' cursor-pointer'
  }

  if (variant === 'ghost') {
    buttonClasses += ' hover:bg-gray-100 text-gray-700'
  } else if (isActive) {
    buttonClasses += ' bg-gray-900 text-white shadow-sm'
  } else {
    buttonClasses += ' text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={buttonClasses}
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
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-50 rounded-md p-4 font-mono text-sm my-4',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic my-4',
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: 'my-6',
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
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
        class: 'prose prose-gray prose-base max-w-none focus:outline-none min-h-[200px]',
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
      <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
          <span className="ml-3 text-gray-600 font-medium">Loading editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rich-text-editor border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-1">
          
          {/* Text Formatting Group */}
          <div className="flex items-center gap-0.5 mr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (⌘+B)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" fill="currentColor"/>
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" fill="currentColor"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (⌘+I)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4h-9l-4 16h9l4-16z" fill="currentColor"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (⌘+U)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="4" y1="21" x2="20" y2="21" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 16h12M6 12h12M6 8h12" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 6h8M8 18h8" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* Headings Group */}
          <div className="flex items-center gap-0.5 mr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <span className="font-bold text-base">H1</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <span className="font-bold text-sm">H2</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <span className="font-bold text-xs">H3</span>
            </ToolbarButton>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* Lists Group */}
          <div className="flex items-center gap-0.5 mr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="10" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2"/>
                <line x1="10" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2"/>
                <line x1="10" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 6h1v4" stroke="currentColor" strokeWidth="2"/>
                <path d="M4 10h2" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-1-1.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              title="Task List"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="m5 8 2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="13" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2"/>
                <line x1="13" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="13" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* Quote & Code Group */}
          <div className="flex items-center gap-0.5 mr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" fill="currentColor"/>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" fill="currentColor"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="16,18 22,12 16,6" stroke="currentColor" strokeWidth="2" fill="none"/>
                <polyline points="8,6 2,12 8,18" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-gray-200 mx-2" />

          {/* Media Group */}
          <div className="flex items-center gap-0.5 mr-3">
            <ToolbarButton
              onClick={addImageFromFile}
              disabled={isUploading}
              title="Add Image"
            >
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </ToolbarButton>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Undo/Redo Group */}
          <div className="flex items-center gap-0.5">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              title="Undo (⌘+Z)"
              variant="ghost"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7v6h6" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              title="Redo (⌘+Shift+Z)"
              variant="ghost"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 7v6h-6" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" stroke="currentColor" strokeWidth="2" fill="none"/>
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
        <EditorContent 
          editor={editor} 
          className="prose prose-base prose-gray max-w-none p-6 focus:outline-none"
        />
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
        <div className="text-gray-400">
          Type <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-mono">**</kbd> for <strong>bold</strong> or <kbd className="px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-mono">⌘+B</kbd>
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
