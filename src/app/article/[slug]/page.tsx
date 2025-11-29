'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'

interface Article {
  id: string
  title: string
  content: string
  contentType: string
  excerpt: string
  slug: string
  publishedAt: string
  readTime: number
  featured: boolean
  edition: {
    id: string
    title: string
    publishDate: string
    editionNumber: number
  }
}

interface NextArticle {
  id: string
  title: string
  slug: string
}

interface Edition {
  id: string
  title: string
  description: string
  publishDate: string
  editionNumber: number
  articles: Article[]
  _count: {
    articles: number
  }
}

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [article, setArticle] = useState<Article | null>(null)
  const [nextArticle, setNextArticle] = useState<NextArticle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditionMenuOpen, setIsEditionMenuOpen] = useState(false)
  const [editions, setEditions] = useState<Edition[]>([])
  const [fromEditionId, setFromEditionId] = useState<string | null>(null)

  // Get the edition ID from query parameter or localStorage
  useEffect(() => {
    // Check if we came from a specific edition via URL parameter
    const searchParams = new URLSearchParams(globalThis.location?.search || '')
    const editionParam = searchParams.get('fromEdition')
    
    if (editionParam) {
      // URL parameter takes priority - update both state and localStorage
      setFromEditionId(editionParam)
      localStorage.setItem('lastViewedEdition', editionParam)
    } else {
      // Only use localStorage if there's no URL parameter
      const lastEdition = localStorage.getItem('lastViewedEdition')
      if (lastEdition) {
        setFromEditionId(lastEdition)
      }
    }
  }, [params.slug]) // Re-run when slug changes to pick up new fromEdition parameter

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchEditions()
      if (params.slug) {
        fetchArticle(params.slug as string)
      }
    }
  }, [status, params.slug, router])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // Close profile menu if clicked outside
      if (isMenuOpen && !target.closest('[data-dropdown="profile"]')) {
        setIsMenuOpen(false)
      }
      
      // Close edition menu if clicked outside
      if (isEditionMenuOpen && !target.closest('[data-dropdown="edition"]')) {
        setIsEditionMenuOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsEditionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isMenuOpen, isEditionMenuOpen])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions)
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    }
  }

  const fetchArticle = async (slug: string) => {
    try {
      const response = await fetch(`/api/articles/${slug}`)
      if (!response.ok) {
        throw new Error('Article not found')
      }
      const data = await response.json()
      setArticle(data.article)
      setNextArticle(data.nextArticle || null)
      
      // Update fromEditionId if we don't have one from URL
      const searchParams = new URLSearchParams(globalThis.location?.search || '')
      const editionParam = searchParams.get('fromEdition')
      if (!editionParam && data.article?.edition?.id) {
        // If no fromEdition parameter, use the article's edition
        setFromEditionId(data.article.edition.id)
        localStorage.setItem('lastViewedEdition', data.article.edition.id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load article')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">{error || 'The article you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            style={{backgroundColor: 'var(--accent-blue)'}}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Floating Back Button */}
      <button
        onClick={() => {
          // Use fromEditionId if available, otherwise use article's edition
          const targetEdition = fromEditionId || article.edition.id
          router.push(`/dashboard?edition=${targetEdition}`)
        }}
        className="fixed left-6 top-24 z-40 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        style={{backgroundColor: 'var(--accent-blue)'}}
        title="Back to Edition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Header with Hamburger Menu */}
      <StandardHeader />

      {/* Main Content Area - Scrollable */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 font-peter">
        {/* Article Header */}
        <div className="mb-8">
          {/* Edition Info */}
          <div className="mb-4">
            <span className="text-sm text-gray-600">
              {article.edition.title} • Edition {article.edition.editionNumber} • {' '}
              {new Date(article.edition.publishDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Article Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{color: 'var(--accent-blue)'}}>
            {article.title}
          </h1>

          {/* Article Meta */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
            {article.featured && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                Featured
              </span>
            )}
            <span>{article.readTime} min read</span>
            <span>
              Published {new Date(article.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          {/* Excerpt */}
          {article.excerpt && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
              <p className="text-lg text-gray-800 leading-relaxed italic">
                {article.excerpt}
              </p>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {article.contentType === 'HTML' ? (
            <div 
              dangerouslySetInnerHTML={{ __html: article.content }}
              className="article-content"
            />
          ) : (
            <div className="whitespace-pre-wrap">
              {article.content}
            </div>
          )}
        </div>

        {/* Next Article Button - Scrollable with content */}
        {nextArticle && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  // Pass the fromEditionId to the next article so navigation context is preserved
                  const targetEdition = fromEditionId || article.edition.id
                  router.push(`/article/${nextArticle.slug}?fromEdition=${targetEdition}`)
                }}
                className="group px-4 py-2 bg-white border border-gray-300 rounded hover:border-blue-600 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors text-sm font-bold">&lt;&lt;</span>
                  <span className="text-sm font-bold group-hover:text-blue-700 transition-colors" style={{color: 'var(--accent-blue)'}}>
                    Next Article
                  </span>
                  <span className="text-gray-400 group-hover:text-blue-600 transition-colors text-sm font-bold">&gt;&gt;</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Back to Dashboard */}
        {/* <div className="mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            style={{backgroundColor: 'var(--accent-blue)'}}
          >
            ← Back to Newsletter
          </button>
        </div> */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <StandardFooter /> 
    </div>
  )
}
