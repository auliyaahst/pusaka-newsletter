'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'

export default function CreateEditionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [coverImages, setCoverImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    publishDate: '',
    editionNumber: '',
    theme: '',
    coverImage: '',
    isPublished: false
  })

  // Redirect if not authenticated or doesn't have permission
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  // Check permissions - only EDITOR, SUPER_ADMIN can create editions
  const allowedRoles = ['EDITOR', 'SUPER_ADMIN']
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to create editions.</p>
          <Link
            href="/dashboard/editorial"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Editorial Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file')
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds maximum allowed (5MB)')
    }
    
    // Convert to base64 for immediate preview
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  const handleMultipleFilesSelect = async (files: FileList) => {
    setIsUploading(true)
    const maxFiles = 10 // Maximum number of images allowed

    if (coverImages.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`)
      setIsUploading(false)
      return
    }

    try {
      const uploadPromises = Array.from(files).map((file) => handleImageUpload(file))
      
      // Simulate progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 10
        setUploadProgress(Math.min(progress, 90))
      }, 100)

      const uploadedImages = await Promise.all(uploadPromises)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setCoverImages(prev => [...prev, ...uploadedImages])
      
      // Update formData with first image as primary or JSON array
      const allImages = [...coverImages, ...uploadedImages]
      setFormData(prev => ({ 
        ...prev, 
        coverImage: JSON.stringify(allImages) // Store as JSON array
      }))

      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload images')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleMultipleFilesSelect(files)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleMultipleFilesSelect(files)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = coverImages.filter((_, i) => i !== index)
    setCoverImages(newImages)
    setFormData(prev => ({ 
      ...prev, 
      coverImage: newImages.length > 0 ? JSON.stringify(newImages) : ''
    }))
  }

  const handleRemoveAllImages = () => {
    setCoverImages([])
    setFormData(prev => ({ ...prev, coverImage: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
        toast.success('Edition created successfully!')
        router.push('/dashboard/editorial')
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message || 'Failed to create edition'}`)
      }
    } catch (error) {
      console.error('Error creating edition:', error)
      toast.error('Failed to create edition')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StandardHeader currentPage="Create Edition" />
      
      <main className="flex-1 bg-gray-50 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Edition</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Create a new newsletter edition with articles and content.</p>
              </div>
              <Link
                href="/dashboard/editorial"
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Editions
              </Link>
            </div>
          </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Edition Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                placeholder="e.g., Future of Transportation"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                rows={4}
                placeholder="Brief description of this edition's focus..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Publish Date *
                </label>
                <input
                  type="date"
                  id="publishDate"
                  required
                  value={formData.publishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="editionNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Edition Number
                </label>
                <input
                  type="number"
                  id="editionNumber"
                  min="1"
                  value={formData.editionNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, editionNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., 2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <input
                type="text"
                id="theme"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                placeholder="e.g., Technology, Environment, Business"
              />
            </div>

            {/* Cover Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Images {coverImages.length > 0 && `(${coverImages.length}/10)`}
              </label>
              
              {/* Upload Zone */}
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                }`}
              >
                <div className="space-y-3">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div className="text-base text-gray-600">
                    <span className="font-medium text-green-600">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each (max 10 images)</p>
                </div>
                
                {isUploading && (
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Image Preview Grid */}
              {coverImages.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-medium text-gray-700">
                      Uploaded Images ({coverImages.length})
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveAllImages}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {coverImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Cover ${index + 1}`}
                          className="w-full h-32 sm:h-40 object-cover rounded-lg"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                            Primary
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage(index)
                          }}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/dashboard/editorial"
                className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors text-center text-sm sm:text-base font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors text-sm sm:text-base font-medium"
              >
                {isSubmitting ? 'Creating...' : 'Create Edition'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
      
      <StandardFooter />
    </div>
  )
}
