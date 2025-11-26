'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { EnhancedEditor } from '@/components/tiptap-templates/enhanced'

export default function CreateBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const editorRef = useRef<{ getHTML: () => string } | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    metaTitle: '',
    metaDescription: '',
    featuredImage: '',
    tags: [] as string[],
    readTime: 5,
    contentType: 'HTML'
  })

  // Redirect if not authenticated or doesn't have permission
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  // Check permissions - only ADMIN, SUPER_ADMIN, EDITOR can create blogs
  const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'EDITOR']
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to create blog posts.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replaceAll(/[^a-z0-9 -]/g, '')
      .replaceAll(/\s+/g, '-')
      .replaceAll(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
      metaTitle: title
    }))
  }

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    setFormData(prev => ({ ...prev, tags }))
  }

  const handleSubmit = async (e: React.FormEvent, statusToSet?: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault()
    
    // Get current editor content
    const currentContent = editorRef.current ? editorRef.current.getHTML() : formData.content
    
    // Create submit data with current editor content and the specified status
    const submitData = {
      ...formData,
      content: currentContent,
      status: statusToSet || formData.status
    }
    
    // Validation
    if (!submitData.title.trim()) {
      toast.error('Blog title is required')
      return
    }
    
    if (!submitData.content.trim() || submitData.content === '<p></p>') {
      toast.error('Blog content is required')
      return
    }
    
    if (!submitData.slug.trim()) {
      toast.error('Blog slug is required')
      return
    }
    
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Blog ${submitData.status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully!`)
        router.push(`/blog/${result.blog.slug}`)
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.error || 'Failed to create blog'}`)
      }
    } catch (error) {
      console.error('Error creating blog:', error)
      toast.error('Error creating blog')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-40 text-white shadow-sm backdrop-blur-md bg-opacity-95" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="h-8 sm:h-10 flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <Image 
                  src="/logo_title.svg" 
                  alt="The Pusaka Newsletter Logo" 
                  width={120}
                  height={40}
                  className="h-8 sm:h-10 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Back to Blog Button */}
              <button
                onClick={() => router.push('/blog')}
                className="hidden sm:flex items-center space-x-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Blog</span>
              </button>

              {/* Hamburger Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Consolidated Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto transform origin-top-right animate-in fade-in scale-in-95 duration-200">
                    {/* Profile Section */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{session.user?.name}</p>
                          <p className="text-xs text-gray-600 truncate">{session.user?.email}</p>
                          {session.user?.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                              {session.user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Dashboard Item */}
                      <button
                        onClick={() => {
                          router.push('/dashboard')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v3H8V5z" />
                        </svg>
                        <span>Dashboard</span>
                      </button>

                      {/* Blog Item */}
                      <button
                        onClick={() => {
                          router.push('/blog')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16l7-4 7 4V4H7z" />
                        </svg>
                        <span>Blog</span>
                      </button>

                      {/* Profile Item */}
                      <button
                        onClick={() => {
                          router.push('/profile')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Profile</span>
                      </button>

                      {/* Subscription Item */}
                      <button
                        onClick={() => {
                          router.push('/subscription')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Subscription</span>
                      </button>

                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={() => {
                            import('next-auth/react').then(({ signOut }) => signOut({ callbackUrl: '/login' }))
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 text-red-600 hover:bg-red-50 px-4 py-3 text-sm transition-colors duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area with padding for fixed header */}
      <main className="flex-1 overflow-hidden w-full font-peter flex flex-col pt-16 pb-20" style={{backgroundColor: 'var(--accent-cream)'}}>
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white rounded-2xl shadow-xl">
              <div className="p-6 sm:p-8">
                {/* Page Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <button
                      onClick={() => router.push('/blog')}
                      className="sm:hidden flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span className="text-sm">Back to Blog</span>
                    </button>
                    <span className="text-2xl">📝</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Blog Post</h1>
                  </div>
                  <p className="text-gray-600">Share your thoughts and insights with the world</p>
                </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                    📝 Basic Information
                  </h4>
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Blog Title *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">This will be the main headline of your blog post</p>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="Enter an engaging title for your blog post"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug *
                  </label>
                  <p className="text-xs text-gray-500 mb-2">This will be part of the blog post&apos;s web address (auto-generated from title)</p>
                  <input
                    type="text"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder="blog-post-url-slug"
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                    Blog Summary
                  </label>
                  <p className="text-xs text-gray-500 mb-2">A brief description of what this blog post is about (optional)</p>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Write a brief summary of your blog post..."
                  />
                </div>
              </div>

              {/* Blog Content */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                  ✍️ Blog Content
                </h4>
                <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg">
                  💡 Use the rich text editor below to write your blog content. You can add formatting, images, links, tables, and more!
                </p>
                
                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    Content *
                  </label>
                  <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                    <EnhancedEditor 
                      value={formData.content}
                      onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                      placeholder="Start writing your amazing blog post here..."
                      height="500px"
                      onEditorReady={(editor) => { editorRef.current = editor }}
                    />
                  </div>
                </div>
              </div>

              {/* Blog Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                  ⚙️ Blog Settings
                </h4>

                {/* Tags */}
                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Add relevant tags to help categorize your blog post</p>
                  <input
                    type="text"
                    id="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="technology, programming, web development (comma-separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
                </div>

                {/* Meta Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Read Time (minutes)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Estimated time to read this blog post</p>
                    <input
                      type="number"
                      id="readTime"
                      min="1"
                      value={formData.readTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, readTime: Number.parseInt(e.target.value) || 5 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 mb-1">
                      Featured Image URL
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Optional cover image for your blog post</p>
                    <input
                      type="url"
                      id="featuredImage"
                      value={formData.featuredImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                  🔍 SEO Settings
                </h4>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Title
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Optimized title that appears in search results</p>
                    <input
                      type="text"
                      id="metaTitle"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="SEO-optimized title"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                      SEO Description
                    </label>
                    <p className="text-xs text-gray-500 mb-2">Brief description that appears in search results</p>
                    <textarea
                      id="metaDescription"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Write a compelling description for search engines..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => router.push('/blog')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting || !formData.title.trim()}
                  onClick={(e) => handleSubmit(e, 'DRAFT')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>💾 Save Draft</span>
                  )}
                </button>
                
                <button
                  type="button"
                  disabled={isSubmitting || !formData.title.trim()}
                  onClick={(e) => handleSubmit(e, 'PUBLISHED')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>🚀 Publish</span>
                  )}
                </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 py-2" style={{backgroundColor: 'var(--accent-cream)'}}>
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} The Pusaka Newsletter
          </p>
        </div>
      </footer>
    </div>
  )
}
