'use client'

import { useEffect, useState } from 'react'

interface Article {
  id: string
  title: string
  excerpt: string
  slug: string
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED'
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  author?: {
    name: string
    email: string
  }
  edition?: {
    title: string
    publishDate: string
  }
}

export default function ArticleManagement() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/editorial/articles')
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

  const updateArticleStatus = async (articleId: string, newStatus: string) => {
    setIsUpdating(articleId)
    try {
      const response = await fetch(`/api/editorial/articles/${articleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchArticles() // Refresh the list
      } else {
        console.error('Failed to update article status')
      }
    } catch (error) {
      console.error('Error updating article status:', error)
    } finally {
      setIsUpdating(null)
    }
  }

  const filteredArticles = articles.filter(article => {
    const matchesStatus = statusFilter === 'ALL' || article.status === statusFilter
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canUpdateStatus = (currentStatus: string) => {
    // Editors can move articles from UNDER_REVIEW to APPROVED or REJECTED
    return currentStatus === 'UNDER_REVIEW'
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
      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'ALL' ? 'All Articles' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Articles ({filteredArticles.length})
          </h3>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredArticles.map((article) => (
              <div key={article.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 truncate">
                        {article.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(article.status)}`}>
                        {article.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {article.excerpt && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Created: {new Date(article.createdAt).toLocaleDateString()}</span>
                      {article.publishedAt && (
                        <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                      )}
                      {article.edition && (
                        <span>Edition: {article.edition.title}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {canUpdateStatus(article.status) && (
                      <>
                        <button
                          onClick={() => updateArticleStatus(article.id, 'APPROVED')}
                          disabled={isUpdating === article.id}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded hover:bg-green-200 disabled:opacity-50"
                        >
                          {isUpdating === article.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => updateArticleStatus(article.id, 'REJECTED')}
                          disabled={isUpdating === article.id}
                          className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          {isUpdating === article.id ? '...' : 'Reject'}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => window.open(`/article/${article.slug}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
