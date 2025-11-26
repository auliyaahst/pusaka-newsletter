'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { EnhancedEditor } from '@/components/tiptap-templates/enhanced'

interface Edition {
  id: string
  title: string
  description: string
  publishDate: string
  editionNumber: number
  isPublished: boolean
}

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  editionId: string
  featured: boolean
  readTime: number
  metaTitle: string
  metaDescription: string
  status: string
}

export default function EditArticlePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const articleId = params.id as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [editions, setEditions] = useState<Edition[]>([])
  const [article, setArticle] = useState<Article | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    editionId: '',
    featured: false,
    readTime: 5,
    metaTitle: '',
    metaDescription: ''
  })
  const [showCreateEdition, setShowCreateEdition] = useState(false)
  const [editionFormData, setEditionFormData] = useState({
    title: '',
    description: '',
    publishDate: '',
    editionNumber: '',
    theme: ''
  })

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/editorial/articles/${articleId}`)
      if (response.ok) {
        const data = await response.json()
        setArticle(data.article)
        setFormData({
          title: data.article.title || '',
          content: data.article.content || '',
          excerpt: data.article.excerpt || '',
          slug: data.article.slug || '',
          editionId: data.article.editionId || '',
          featured: data.article.featured || false,
          readTime: data.article.readTime || 5,
          metaTitle: data.article.metaTitle || '',
          metaDescription: data.article.metaDescription || ''
        })
      } else {
        toast.error('Article not found')
        router.push('/dashboard/editorial')
      }
    } catch (error) {
      console.error('Error fetching article:', error)
      toast.error('Error loading article')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editorial/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions || [])
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchArticle()
      fetchEditions()
    }
  }, [status, articleId])

  // Redirect if not authenticated or doesn't have permission
  if (status === 'loading' || isLoading) {
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

  // Check permissions - only EDITOR, SUPER_ADMIN can edit articles
  const allowedRoles = ['EDITOR', 'SUPER_ADMIN']
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to edit articles.</p>
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
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/editorial/articles/${articleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Article updated successfully!')
        router.push('/dashboard/editorial')
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message || 'Failed to update article'}`)
      }
    } catch (error) {
      console.error('Error updating article:', error)
      toast.error('Error updating article')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateEdition = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/editorial/editions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editionFormData,
          editionNumber: editionFormData.editionNumber ? parseInt(editionFormData.editionNumber) : null
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Edition created and published successfully!')
        
        // Refresh editions list
        await fetchEditions()
        
        // Select the newly created edition
        setFormData(prev => ({ ...prev, editionId: result.edition.id }))
        
        // Close the create edition form
        setShowCreateEdition(false)
        setEditionFormData({
          title: '',
          description: '',
          publishDate: '',
          editionNumber: '',
          theme: ''
        })
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message || 'Failed to create edition'}`)
      }
    } catch (error) {
      console.error('Error creating edition:', error)
      toast.error('Error creating edition')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
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
              {/* Back to Editorial Button */}
              <button
                onClick={() => router.push('/dashboard/editorial')}
                className="hidden sm:flex items-center space-x-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Editorial</span>
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

                      {/* Editorial Item */}
                      <button
                        onClick={() => {
                          router.push('/dashboard/editorial')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Editorial</span>
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

      {/* Main Content Area with top padding for fixed header */}
      <main className="flex-1 w-full font-peter flex flex-col pt-16 pb-20" style={{backgroundColor: 'var(--accent-cream)'}}>
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <div className="bg-white rounded-2xl shadow-xl">
              <div className="p-6 sm:p-8">
                {/* Page Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <button
                      onClick={() => router.push('/dashboard/editorial')}
                      className="sm:hidden flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span className="text-sm">Back to Editorial</span>
                    </button>
                    <span className="text-2xl">✏️</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Article</h1>
                  </div>
                  <p className="text-gray-600">Update your article content and settings. Fields marked with * are required.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                      📝 Basic Information
                    </h4>
                    
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Article Title *
                      </label>
                      <p className="text-xs text-gray-500 mb-2">This will be the main headline of your article</p>
                      <input
                        type="text"
                        id="title"
                        required
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                        placeholder="Enter a compelling title for your article"
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                        URL Slug *
                      </label>
                      <p className="text-xs text-gray-500 mb-2">This will be part of the article&apos;s web address (auto-generated from title)</p>
                      <input
                        type="text"
                        id="slug"
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="article-url-slug"
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                        Article Summary
                      </label>
                      <p className="text-xs text-gray-500 mb-2">A brief description of what this article is about (optional)</p>
                      <textarea
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Write a brief summary of your article..."
                      />
                    </div>
                  </div>

                  {/* Article Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                      ⚙️ Article Settings
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="readTime" className="block text-sm font-medium text-gray-700 mb-1">
                          📖 Estimated Reading Time
                        </label>
                        <p className="text-xs text-gray-500 mb-2">How long will it take to read this article? (in minutes)</p>
                        <input
                          type="number"
                          id="readTime"
                          min="1"
                          value={formData.readTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, readTime: parseInt(e.target.value) || 5 }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="5"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="editionId" className="block text-sm font-medium text-gray-700 mb-1">
                          📰 Newsletter Edition
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Assign this article to a specific newsletter edition (optional)</p>
                        <select
                          id="editionId"
                          value={formData.editionId}
                          onChange={(e) => setFormData(prev => ({ ...prev, editionId: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">No specific edition</option>
                          {editions.map((edition) => (
                            <option key={edition.id} value={edition.id}>
                              {edition.title} {edition.editionNumber ? `(#${edition.editionNumber})` : ''} {!edition.isPublished ? '- Draft' : ''}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowCreateEdition(true)}
                          className="mt-2 w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center border border-blue-300"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create New Edition
                        </button>
                      </div>
                    </div>

                    {/* Featured checkbox */}
                    <div className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="featured" className="ml-3 block text-sm text-gray-700 font-medium">
                        ⭐ Featured Article
                      </label>
                      <p className="ml-2 text-xs text-gray-500">
                        Mark as featured to highlight this article on the homepage
                      </p>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                      ✍️ Article Content
                    </h4>
                    <div>
                      <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        Write Your Article *
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Write your article content below using the rich text editor.
                      </p>
                      <div className="w-full">
                        <EnhancedEditor 
                          value={formData.content}
                          onChange={(content: string) => setFormData(prev => ({ ...prev, content }))}
                          placeholder="Start writing your amazing article here..."
                          height="500px"
                        />
                      </div>
                      {/* Hidden textarea for form validation */}
                      <textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                        className="sr-only"
                        required
                        tabIndex={-1}
                      />
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center">
                      🔍 SEO Settings
                    </h4>
                    <p className="text-xs text-gray-500 mb-4 bg-blue-50 p-3 rounded-lg">
                      💡 These settings help your article appear better in search engines and social media. (All optional)
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                          SEO Title
                        </label>
                        <p className="text-xs text-gray-500 mb-2">Title that appears in search results (uses article title if empty)</p>
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
                      onClick={() => router.push('/dashboard/editorial')}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !formData.title || !formData.content}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          💾 Update Article
                        </>
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

      {/* Create Edition Modal */}
      {showCreateEdition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">📰 Create New Edition</h3>
                <button
                  onClick={() => setShowCreateEdition(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateEdition} className="space-y-4">
                <div>
                  <label htmlFor="editionTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Edition Title *
                  </label>
                  <input
                    type="text"
                    id="editionTitle"
                    required
                    value={editionFormData.title}
                    onChange={(e) => setEditionFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Future of Transportation"
                  />
                </div>

                <div>
                  <label htmlFor="editionDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="editionDescription"
                    value={editionFormData.description}
                    onChange={(e) => setEditionFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of this edition's focus..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="editionPublishDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      id="editionPublishDate"
                      required
                      value={editionFormData.publishDate}
                      onChange={(e) => setEditionFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="editionNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Edition Number
                    </label>
                    <input
                      type="number"
                      id="editionNumber"
                      min="1"
                      value={editionFormData.editionNumber}
                      onChange={(e) => setEditionFormData(prev => ({ ...prev, editionNumber: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="editionTheme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    id="editionTheme"
                    value={editionFormData.theme}
                    onChange={(e) => setEditionFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Technology, Environment, Business"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateEdition(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Edition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
