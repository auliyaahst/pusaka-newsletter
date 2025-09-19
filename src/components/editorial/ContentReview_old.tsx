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
  reviewNotes?: ReviewNote[]
}

interface ReviewNote {
  id: string
  note: string
  decision: string
  createdAt: string
  reviewer: {
    name: string
    email: string
  }
  highlights?: any // JSON data from database
}

export default function ContentReview() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'UNDER_REVIEW' | 'REJECTED'>('UNDER_REVIEW')

  useEffect(() => {
    fetchArticles()
  }, [statusFilter])

  const fetchArticles = async () => {
    try {
      const response = await fetch(`/api/editorial/articles?status=${statusFilter}`)
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      } else {
        console.error('Failed to fetch articles')
      }
    } catch (error) {
      console.error('Error fetching articles:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-gray-600">Loading articles...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Content Review & Feedback</h3>
        <p className="text-sm text-gray-600">
          View articles under review and those rejected with feedback for improvement
        </p>
      </div>

      {/* Status Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Under Review ({articles.filter(a => a.status === 'UNDER_REVIEW').length})
          </button>
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-4 py-2 rounded-md font-medium ${
              statusFilter === 'REJECTED'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Needs Revision ({articles.filter(a => a.status === 'REJECTED').length})
          </button>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'UNDER_REVIEW' ? 'No articles under review' : 'No articles need revision'}
          </h3>
          <p className="text-gray-600">
            {statusFilter === 'UNDER_REVIEW' 
              ? 'All articles are either approved or need revision.' 
              : 'All rejected articles have been revised and resubmitted.'
            }
          </p>
        </div>
      ) : (
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

                  {/* Previous Review Notes */}
                  {selectedArticle.reviewNotes && selectedArticle.reviewNotes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">Previous Review Notes</h4>
                      <div className="space-y-3">
                        {selectedArticle.reviewNotes.map((note) => (
                          <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {note.reviewer.name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                note.decision === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {note.decision}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{note.note}</p>
                            {note.highlights && Array.isArray(note.highlights) && note.highlights.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">Text Highlights:</p>
                                <div className="space-y-1">
                                  {note.highlights.map((highlight: any, index: number) => (
                                    <div key={`${note.id}-highlight-${index}`} className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                                      <p className="font-medium text-yellow-800">"{highlight.selectedText}"</p>
                                      {highlight.comment && (
                                        <p className="text-yellow-700 mt-1">{highlight.comment}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
