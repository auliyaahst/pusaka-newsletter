'use client'

import { useState } from 'react'
import { EnhancedEditor } from '@/components/tiptap-templates/enhanced'

export default function Page() {
  const [content, setContent] = useState(`
    <h1>Microsoft Word-like Rich Text Editor</h1>
    <p>This enhanced TipTap editor provides a comprehensive writing experience similar to Microsoft Word and Google Docs. Try out all the features below:</p>
    
    <h2>🎨 Text Formatting</h2>
    <p>You can format text with <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s>. Change text colors, highlight text, and choose from multiple font families and sizes.</p>
    
    <h2>📋 Lists and Structure</h2>
    <ul>
      <li>Create bullet lists</li>
      <li>Add numbered lists</li>
      <li>Make task lists with checkboxes</li>
    </ul>
    
    <h2>📊 Advanced Features</h2>
    <p>Insert tables, images, links, code blocks, and more. The editor supports:</p>
    <ul>
      <li>✅ Multiple heading levels (H1-H6)</li>
      <li>✅ Text alignment (left, center, right, justify)</li>
      <li>✅ Superscript<sup>text</sup> and subscript<sub>text</sub></li>
      <li>✅ Blockquotes for important information</li>
      <li>✅ Code blocks with syntax highlighting</li>
      <li>✅ Tables with resizable columns</li>
      <li>✅ Image insertion and upload</li>
      <li>✅ Link creation and management</li>
    </ul>
    
    <blockquote>
      <p>This is a beautifully styled blockquote that draws attention to important information.</p>
    </blockquote>
    
    <p>Try editing this content to see all the features in action!</p>
  `)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Enhanced Rich Text Editor
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the power of a Microsoft Word-like editor built with TipTap. 
            This enhanced editor provides comprehensive formatting tools, real-time collaboration features, 
            and a professional writing experience for your content creation needs.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🚀 Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">📝 Rich Formatting</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Multiple font families</li>
                <li>• Custom font sizes</li>
                <li>• Text colors & highlights</li>
                <li>• Bold, italic, underline</li>
                <li>• Superscript & subscript</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">📋 Content Structure</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Six heading levels</li>
                <li>• Multiple list types</li>
                <li>• Task lists with checkboxes</li>
                <li>• Blockquotes</li>
                <li>• Code blocks</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-600">🎯 Advanced Tools</h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Tables with resize</li>
                <li>• Image upload & insertion</li>
                <li>• Smart link creation</li>
                <li>• Text alignment options</li>
                <li>• Character & word count</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              ✨ Try the Enhanced Editor
            </h2>
            <p className="text-gray-600 mt-1">
              Edit the content below to experience all the rich text editing features
            </p>
          </div>
          
          <div className="p-6">
            <EnhancedEditor
              value={content}
              onChange={setContent}
              placeholder="Start creating amazing content with our enhanced editor..."
              height="700px"
            />
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💡 Pro Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
              <ul className="space-y-1">
                <li>• <kbd className="bg-white px-1 rounded">Ctrl+B</kbd> - Bold</li>
                <li>• <kbd className="bg-white px-1 rounded">Ctrl+I</kbd> - Italic</li>
                <li>• <kbd className="bg-white px-1 rounded">Ctrl+U</kbd> - Underline</li>
                <li>• <kbd className="bg-white px-1 rounded">Ctrl+K</kbd> - Insert Link</li>
                <li>• <kbd className="bg-white px-1 rounded">Ctrl+Z</kbd> - Undo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1">
                <li>• Drag and drop image upload</li>
                <li>• Real-time character counting</li>
                <li>• Responsive design for all devices</li>
                <li>• Print-ready document styling</li>
                <li>• Professional document appearance</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
