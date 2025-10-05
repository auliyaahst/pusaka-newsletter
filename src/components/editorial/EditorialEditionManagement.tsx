'use client'

import { useState, useEffect } from 'react'

interface Edition {
  id: string
  title: string
  description: string | null
  publishDate: string
  editionNumber: number | null
  theme: string | null
  coverImage: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
  _count: {
    articles: number
  }
}

export default function EditorialEditionManagement() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publishDate: '',
    editionNumber: '',
    theme: '',
    coverImage: '',
    isPublished: false
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      publishDate: '',
      editionNumber: '',
      theme: '',
      coverImage: '',
      isPublished: false
    })
    setEditingEdition(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingEdition 
        ? `/api/editorial/editions/${editingEdition.id}`
        : '/api/editorial/editions'
      
      const response = await fetch(url, {
        method: editingEdition ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          editionNumber: formData.editionNumber ? parseInt(formData.editionNumber) : null
        }),
      })

      if (response.ok) {
        const action = editingEdition ? 'updated' : 'created'
        alert(`✅ Edition ${action} successfully!`)
        setShowAddForm(false)
        setShowEditForm(false)
        resetForm()
        await fetchEditions()
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.message || 'Failed to save edition'}`)
      }
    } catch (error) {
      console.error('Error saving edition:', error)
      alert('❌ Error saving edition')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (edition: Edition) => {
    setEditingEdition(edition)
    setFormData({
      title: edition.title,
      description: edition.description || '',
      publishDate: edition.publishDate.split('T')[0],
      editionNumber: edition.editionNumber?.toString() || '',
      theme: edition.theme || '',
      coverImage: edition.coverImage || '',
      isPublished: edition.isPublished
    })
    setShowEditForm(true)
  }

  const handleDelete = async (editionId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/editorial/editions/${editionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('✅ Edition deleted successfully!')
        await fetchEditions()
      } else {
        const error = await response.json()
        alert(`❌ Error: ${error.message || 'Failed to delete edition'}`)
      }
    } catch (error) {
      console.error('Error deleting edition:', error)
      alert('❌ Error deleting edition')
    }
  }

  const togglePublished = async (editionId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/editorial/editions/${editionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !currentStatus
        }),
      })

      if (response.ok) {
        await fetchEditions()
      } else {
        alert('Failed to update edition status')
      }
    } catch (error) {
      console.error('Error updating edition:', error)
      alert('Error updating edition')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
        <span className="ml-3 text-sm sm:text-base text-gray-600">Loading editions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edition Management</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Create and manage newsletter editions. Control publication status and content.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-md text-sm sm:text-base font-medium flex items-center justify-center sm:justify-start flex-shrink-0"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="whitespace-nowrap">Create New Edition</span>
        </button>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {editingEdition ? 'Edit Edition' : 'Create New Edition'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setShowEditForm(false)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Edition Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Future of Transportation"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Brief description of this edition's focus..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="publishDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Publish Date *
                    </label>
                    <input
                      type="date"
                      id="publishDate"
                      required
                      value={formData.publishDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="editionNumber" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Edition Number
                    </label>
                    <input
                      type="number"
                      id="editionNumber"
                      min="1"
                      value={formData.editionNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, editionNumber: e.target.value }))}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="theme" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <input
                    type="text"
                    id="theme"
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Technology, Environment, Business"
                  />
                </div>

                <div>
                  <label htmlFor="coverImage" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    id="coverImage"
                    value={formData.coverImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/cover-image.jpg"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="isPublished" className="text-xs sm:text-sm font-medium text-gray-700">
                    Publish immediately
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setShowEditForm(false)
                      resetForm()
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? (editingEdition ? 'Updating...' : 'Creating...') : (editingEdition ? 'Update Edition' : 'Create Edition')}
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
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage all newsletter editions and control their publication status.</p>
        </div>

        {editions.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
              </svg>
            </div>
            <p className="text-sm sm:text-base text-gray-500">No editions found. Create your first edition to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {editions.map((edition) => (
              <div key={edition.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 break-words">
                        {edition.title}
                      </h4>
                      {edition.editionNumber && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium flex-shrink-0">
                          #{edition.editionNumber}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                        edition.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {edition.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    
                    {edition.description && (
                      <p className="text-sm sm:text-base text-gray-600 mt-2 break-words">{edition.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                      <span>📅 {new Date(edition.publishDate).toLocaleDateString()}</span>
                      <span>📝 {edition._count?.articles || 0} {edition._count?.articles === 1 ? 'article' : 'articles'}</span>
                      {edition.theme && <span className="break-words">🏷️ {edition.theme}</span>}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => handleEdit(edition)}
                      className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs sm:text-sm font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => togglePublished(edition.id, edition.isPublished)}
                      className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                        edition.isPublished
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {edition.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(edition.id, edition.title)}
                      className="flex-1 sm:flex-none px-3 py-1.5 sm:py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs sm:text-sm font-medium transition-colors"
                    >
                      Delete
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