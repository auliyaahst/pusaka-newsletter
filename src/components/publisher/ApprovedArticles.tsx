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
  publishedAt: string | null
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

export default function ApprovedArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchApprovedArticles()
  }, [])

  const fetchApprovedArticles = async () => {
    try {
      const response = await fetch('/api/publisher/articles?status=APPROVED')
      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles)
      } else {
        console.error('Failed to fetch approved articles')
      }
    } catch (error) {
      console.error('Error fetching approved articles:', error)
    } finally {
      setLoading(false)
    }
  }

  const publishArticle = async (articleId: string) => {
    setIsUpdating(articleId)
    try {
      const response = await fetch(`/api/publisher/articles/${articleId}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        await fetchApprovedArticles()
        setSelectedArticle(null)
      } else {
        console.error('Failed to publish article')
      }
    } catch (error) {
      console.error('Error publishing article:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading approved articles...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Approved Articles Ready for Publishing</h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {articles.length} article{articles.length !== 1 ? 's' : ''} approved and ready to be published
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow text-center">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No approved articles</h3>
          <p className="text-sm sm:text-base text-gray-600">All approved articles have been published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Articles List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Ready to Publish</h4>
              </div>
              <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
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
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        Approved
                      </span>
                      <span className="ml-2">
                        Approved {new Date(article.updatedAt).toLocaleDateString()}
                      </span>
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
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedArticle.title}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                          {selectedArticle.status}
                        </span>
                        <span>By {selectedArticle.author?.name}</span>
                        <span>Approved: {new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                        {selectedArticle.publishedAt && (
                          <span>Ready since: {new Date(selectedArticle.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => publishArticle(selectedArticle.id)}
                        disabled={isUpdating === selectedArticle.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isUpdating === selectedArticle.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Publishing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                            🚀 Publish Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Article Content Preview */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  {selectedArticle.excerpt && (
                    <div className="mb-4 p-3 bg-gray-50 border-l-4 border-blue-500">
                      <p className="text-gray-700 italic">{selectedArticle.excerpt}</p>
                    </div>
                  )}
                  
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                  />

                  {/* Article Metadata */}
                  {(selectedArticle.metaTitle || selectedArticle.metaDescription) && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">SEO Metadata</h4>
                      {selectedArticle.metaTitle && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-600">Meta Title:</span>
                          <p className="text-sm text-gray-800">{selectedArticle.metaTitle}</p>
                        </div>
                      )}
                      {selectedArticle.metaDescription && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Meta Description:</span>
                          <p className="text-sm text-gray-800">{selectedArticle.metaDescription}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      ✅ This article has been approved and is ready for publication.
                    </p>
                    <button
                      onClick={() => publishArticle(selectedArticle.id)}
                      disabled={isUpdating === selectedArticle.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isUpdating === selectedArticle.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          🚀 Publish Now
                        </>
                      )}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Article to Preview</h3>
                <p className="text-gray-600">Choose an approved article from the list to preview and publish.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
