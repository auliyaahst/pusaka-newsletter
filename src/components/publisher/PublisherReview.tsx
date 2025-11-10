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
  highlights?: { selectedText: string; comment?: string }[]
}

interface TextHighlight {
  id: string
  startOffset: number
  endOffset: number
  selectedText: string
  comment?: string
}

export default function PublisherReview() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [reviewNote, setReviewNote] = useState('')
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [highlights, setHighlights] = useState<TextHighlight[]>([])
  const [isHighlightMode, setIsHighlightMode] = useState(false)
  const [selectedText, setSelectedText] = useState('')
  const [highlightComment, setHighlightComment] = useState('')
  const [showHighlightModal, setShowHighlightModal] = useState(false)

  useEffect(() => {
    fetchPendingReviews()
  }, [])

  const selectArticle = async (article: Article) => {
    try {
      setLoading(true)
      // Fetch full article details including content
      const response = await fetch(`/api/publisher/articles/${article.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedArticle(data.article)
      } else {
        console.error('Failed to fetch article details')
        // Fallback to the article from the list (without content)
        setSelectedArticle(article)
      }
    } catch (error) {
      console.error('Error fetching article details:', error)
      // Fallback to the article from the list (without content)
      setSelectedArticle(article)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch('/api/publisher/articles?status=UNDER_REVIEW')
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
      const response = await fetch(`/api/publisher/articles/${articleId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          decision,
          note: reviewNote,
          highlights: decision === 'REJECTED' ? highlights : undefined
        }),
      })

      if (response.ok) {
        await fetchPendingReviews()
        setSelectedArticle(null)
        setReviewNote('')
        setShowDeclineModal(false)
        setHighlights([])
        setIsHighlightMode(false)
      } else {
        console.error('Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim() && isHighlightMode) {
      const selectedText = selection.toString().trim()
      setSelectedText(selectedText)
      setShowHighlightModal(true)
    }
  }

  const addHighlight = () => {
    if (selectedText && selectedArticle) {
      const newHighlight: TextHighlight = {
        id: Date.now().toString(),
        startOffset: 0,
        endOffset: selectedText.length,
        selectedText,
        comment: highlightComment
      }
      
      setHighlights(prev => [...prev, newHighlight])
      setShowHighlightModal(false)
      setHighlightComment('')
      setSelectedText('')
      
      window.getSelection()?.removeAllRanges()
    }
  }

  const removeHighlight = (highlightId: string) => {
    setHighlights(prev => prev.filter(h => h.id !== highlightId))
  }

  const toggleHighlightMode = () => {
    setIsHighlightMode(!isHighlightMode)
    if (!isHighlightMode) {
      setHighlights([])
    }
  }

  const handleApprove = () => {
    if (selectedArticle) {
      submitReview(selectedArticle.id, 'APPROVED')
    }
  }

  const handleDecline = () => {
    setShowDeclineModal(true)
  }

  const confirmDecline = () => {
    if (selectedArticle) {
      submitReview(selectedArticle.id, 'REJECTED')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-sm sm:text-base text-gray-600">Loading pending reviews...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Article Review Queue</h3>
        <p className="text-xs sm:text-sm text-gray-600">
          {articles.length} article{articles.length !== 1 ? 's' : ''} pending publisher review
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 rounded-lg shadow text-center">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-sm sm:text-base text-gray-600">No articles are currently pending review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Articles List */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Pending Reviews</h4>
              </div>
              <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => selectArticle(article)}
                    className={`w-full p-3 sm:p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors ${
                      selectedArticle?.id === article.id ? 'bg-purple-50 border-r-2 sm:border-r-4 border-purple-500' : ''
                    }`}
                  >
                    <h5 className="text-sm sm:text-base font-medium text-gray-900 truncate">{article.title}</h5>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{article.excerpt}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>Submitted {new Date(article.updatedAt).toLocaleDateString()}</span>
                      {article.readTime && (
                        <span className="flex items-center">
                          <span className="hidden sm:inline">•</span>
                          <span className="sm:ml-2">{article.readTime} min read</span>
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article Preview */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {selectedArticle ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{selectedArticle.title}</h3>
                      {selectedArticle.edition && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">
                          Edition: {selectedArticle.edition.title}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full self-start sm:self-auto flex-shrink-0">
                      Under Review
                    </span>
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-4 max-h-[400px] overflow-y-auto">
                  {selectedArticle.excerpt && (
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Excerpt</h4>
                      <p className="text-sm sm:text-base text-gray-700 italic">{selectedArticle.excerpt}</p>
                    </div>
                  )}

                  {/* Highlight Mode Toggle */}
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900">Content</h4>
                    <button
                      onClick={toggleHighlightMode}
                      className={`px-3 py-1.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        isHighlightMode 
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isHighlightMode ? '📝 Highlighting Mode ON' : '🖍️ Enable Highlighting'}
                    </button>
                  </div>

                  {/* Highlights Summary */}
                  {highlights.length > 0 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <h5 className="text-xs sm:text-sm font-medium text-yellow-800 mb-2">
                        Text Highlights ({highlights.length})
                      </h5>
                      <div className="space-y-2">
                        {highlights.map((highlight) => (
                          <div key={highlight.id} className="text-xs bg-white p-2 rounded border">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 mb-1 break-words">&quot;{highlight.selectedText}&quot;</p>
                                {highlight.comment && (
                                  <p className="text-gray-600 break-words">{highlight.comment}</p>
                                )}
                              </div>
                              <button
                                onClick={() => removeHighlight(highlight.id)}
                                className="flex-shrink-0 text-red-500 hover:text-red-700 text-lg leading-none"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-4 sm:mb-6">
                    <article 
                      className={`prose prose-sm sm:prose max-w-none text-gray-700 ${
                        isHighlightMode ? 'cursor-text select-text' : ''
                      }`}
                      onMouseUp={isHighlightMode ? handleTextSelection : undefined}
                      dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                    />
                    {isHighlightMode && (
                      <p className="text-xs text-yellow-600 mt-2 italic">
                        Select text to highlight and add feedback comments
                      </p>
                    )}
                  </div>

                  {/* Previous Review Notes */}
                  {selectedArticle.reviewNotes && selectedArticle.reviewNotes.length > 0 && (
                    <div className="mb-4 sm:mb-6">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Previous Review Notes</h4>
                      <div className="space-y-3">
                        {selectedArticle.reviewNotes.map((note) => (
                          <div key={note.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mb-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-900">
                                {note.reviewer.name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full self-start sm:self-auto ${
                                note.decision === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {note.decision}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-700 break-words">{note.note}</p>
                            {note.highlights && Array.isArray(note.highlights) && note.highlights.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-600 mb-1">Text Highlights:</p>
                                <div className="space-y-1">
                                  {note.highlights.map((highlight: { selectedText: string; comment?: string }, index: number) => (
                                    <div key={`${note.id}-highlight-${index}`} className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                                      <p className="font-medium text-yellow-800 break-words">&quot;{highlight.selectedText}&quot;</p>
                                      {highlight.comment && (
                                        <p className="text-yellow-700 mt-1 break-words">{highlight.comment}</p>
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
                </div>

                {/* Action Buttons */}
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={handleApprove}
                      disabled={isUpdating}
                      className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdating ? 'Processing...' : '✓ Approve for Publishing'}
                    </button>
                    <button
                      onClick={handleDecline}
                      disabled={isUpdating}
                      className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdating ? 'Processing...' : '✗ Decline'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
                <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Select an Article to Review</h3>
                <p className="text-sm sm:text-base text-gray-600">Choose an article from the list to preview and review its content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Decline Article</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Please provide feedback to help the editor improve this article.
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="declineNote" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Feedback for Editor (Required)
              </label>
              <textarea
                id="declineNote"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Explain why this article needs revision..."
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={4}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowDeclineModal(false)
                  setReviewNote('')
                }}
                className="w-full sm:flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                disabled={!reviewNote.trim() || isUpdating}
                className="w-full sm:flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Processing...' : 'Decline Article'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Highlight Modal */}
      {showHighlightModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Add Highlight Comment</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-4">
                Selected text: &quot;<span className="font-semibold italic break-words">{selectedText}</span>&quot;
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="highlightComment" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Comment for this highlight (Optional)
              </label>
              <textarea
                id="highlightComment"
                value={highlightComment}
                onChange={(e) => setHighlightComment(e.target.value)}
                placeholder="Explain what needs to be improved in this section..."
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setShowHighlightModal(false)
                  setHighlightComment('')
                  setSelectedText('')
                }}
                className="w-full sm:flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addHighlight}
                className="w-full sm:flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded-md text-sm sm:text-base font-medium transition-colors"
              >
                Add Highlight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
