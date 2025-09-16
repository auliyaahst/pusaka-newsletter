'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

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

export default function ArticlePage() {
  const params = useParams()
  const router = useRouter()
  const { status } = useSession()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated' && params.slug) {
      fetchArticle(params.slug as string)
    }
  }, [status, params.slug, router])

  const fetchArticle = async (slug: string) => {
    try {
      const response = await fetch(`/api/articles/${slug}`)
      if (!response.ok) {
        throw new Error('Article not found')
      }
      const data = await response.json()
      setArticle(data.article)
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Header */}
      <header className="text-white" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo_title.svg" 
                alt="The Pusaka Newsletter Logo" 
                className="h-16 w-auto"
                style={{
                  filter: 'brightness(0) invert(1)'
                }}
              />
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-blue-200 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 py-8 font-peter">
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

        {/* Back to Dashboard */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            style={{backgroundColor: 'var(--accent-blue)'}}
          >
            ← Back to Newsletter
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-white py-4 px-8 mt-16" style={{backgroundColor: 'var(--accent-blue)'}}>
        <p className="text-center text-sm max-w-4xl mx-auto">© The Pusaka Newsletter</p>
      </footer>
    </div>
  )
}
