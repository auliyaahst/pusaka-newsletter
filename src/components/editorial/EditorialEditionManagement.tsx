'use client'

import { useState, useEffect } from 'react'

interface Edition {
  id: string
  title: string
  description: string | null
  publishDate: string
  editionNumber: number | null
  theme: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function EditorialEditionManagement() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publishDate: '',
    editionNumber: '',
    theme: ''
  })

  useEffect(() => {
    fetchEditions()
  }, [])

  const fetchEditions = async () => {
    try {
      const response = await fetch('/api/editorial/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions || [])
      } else {
        console.error('Failed to fetch editions')
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/editorial/editions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          editionNumber: formData.editionNumber ? parseInt(formData.editionNumber) : null
        }),
      })

      if (response.ok) {
        alert('✅ Edition created successfully!')
        setShowAddForm(false)
        setFormData({
          title: '',
          description: '',
          publishDate: '',
          editionNumber: '',
          theme: ''
        })
        await fetchEditions() // Refresh the list
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.message || 'Failed to create edition'}`)
      }
    } catch (error) {
      console.error('Error creating edition:', error)
      alert('❌ Error creating edition')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-gray-600">Loading editions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Title and Button */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Edition Management</h2>
        <p className="text-sm sm:text-base text-gray-600">Create and manage newsletter editions for your articles</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium flex items-center justify-center sm:justify-start transition-colors duration-200"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Edition
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">📰 Create New Edition</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Edition Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., Future of Transportation"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    rows={3}
                    placeholder="Brief description of this edition's focus..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      id="publishDate"
                      required
                      value={formData.publishDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
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
                      value={formData.editionNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, editionNumber: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="e.g., 4"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="e.g., Technology, Environment, Business"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors duration-200"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Edition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Editions List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Newsletter Editions ({editions.length})
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Note: Only admins can publish editions. New editions start as drafts.</p>
        </div>

        {editions.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">No editions found. Create your first edition to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {editions.map((edition) => (
              <div key={edition.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {edition.title}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {edition.editionNumber && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs sm:text-sm font-medium">
                            #{edition.editionNumber}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs sm:text-sm font-medium ${
                          edition.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {edition.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    
                    {edition.description && (
                      <p className="text-sm sm:text-base text-gray-600 mt-2 break-words">{edition.description}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                      <span>📅 {new Date(edition.publishDate).toLocaleDateString()}</span>
                      {edition.theme && <span>🏷️ {edition.theme}</span>}
                      <span>📝 Created {new Date(edition.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right text-xs sm:text-sm text-gray-500 flex-shrink-0">
                    {!edition.isPublished && (
                      <p className="italic">Contact admin to publish</p>
                    )}
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