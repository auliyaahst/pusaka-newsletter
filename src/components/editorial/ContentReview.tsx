'use client'

import { useEffect, useState } from 'react'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  readTime?: number
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  author?: {
    name: string
    email: string
  }
  edition?: {
    title: string
    publishDate: string
  }
}

export default function ContentReview() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [reviewNote, setReviewNote] = useState('')

  useEffect(() => {
    fetchPendingReviews()
  }, [])

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch('/api/editorial/articles?status=UNDER_REVIEW')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      } else {
        console.error('Failed to fetch pending reviews')
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitReview = async (articleId: string, decision: 'APPROVED' | 'REJECTED') => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/editorial/articles/${articleId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          decision,
          note: reviewNote 
        }),
      })

      if (response.ok) {
        await fetchPendingReviews()
        setSelectedArticle(null)
        setReviewNote('')
      } else {
        console.error('Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-gray-600">Loading pending reviews...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Content Review Queue</h3>
        <p className="text-sm text-gray-600">
          {articles.length} article{articles.length !== 1 ? 's' : ''} pending review
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No articles are currently pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Articles List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">Pending Reviews</h4>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                      selectedArticle?.id === article.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <h5 className="font-medium text-gray-900 truncate">{article.title}</h5>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>Submitted {new Date(article.updatedAt).toLocaleDateString()}</span>
                      {article.readTime && (
                        <span className="ml-2">{article.readTime} min read</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article Preview */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedArticle.title}</h3>
                      {selectedArticle.edition && (
                        <p className="text-sm text-gray-600 mt-1">
                          Edition: {selectedArticle.edition.title}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Under Review
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  {selectedArticle.excerpt && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Excerpt</h4>
                      <p className="text-gray-700 italic">{selectedArticle.excerpt}</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                    <div 
                      className="prose max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />
                  </div>

                  {(selectedArticle.metaTitle || selectedArticle.metaDescription) && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">SEO Metadata</h4>
                      {selectedArticle.metaTitle && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">Title:</span>
                          <p className="text-sm text-gray-800">{selectedArticle.metaTitle}</p>
                        </div>
                      )}
                      {selectedArticle.metaDescription && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Description:</span>
                          <p className="text-sm text-gray-800">{selectedArticle.metaDescription}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="mb-4">
                    <label htmlFor="reviewNote" className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes (Optional)
                    </label>
                    <textarea
                      id="reviewNote"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="Add any notes or feedback..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => submitReview(selectedArticle.id, 'APPROVED')}
                      disabled={isUpdating}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Processing...' : '✓ Approve'}
                    </button>
                    <button
                      onClick={() => submitReview(selectedArticle.id, 'REJECTED')}
                      disabled={isUpdating}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Processing...' : '✗ Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Article to Review</h3>
                <p className="text-gray-600">Choose an article from the list to preview and review its content.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
