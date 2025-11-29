'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'

type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

interface Blog {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  status: BlogStatus
  metaTitle?: string
  metaDescription?: string
  featuredImage?: string
  featured: boolean
  tags: string[]
}

export default function EditBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const blogSlug = params.slug as string
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [featuredImage, setFeaturedImage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    tags: '',
    featured: false,
    status: 'DRAFT' as BlogStatus
  })

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogSlug}`)
      if (response.ok) {
        const data = await response.json()
        const blog = data.blog
        setFormData({
          title: blog.title,
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || '',
          tags: blog.tags.join(', '),
          featured: blog.featured,
          status: blog.status
        })

        if (blog.featuredImage) {
          setFeaturedImage(blog.featuredImage)
        }
      } else {
        toast.error('Blog not found')
        router.push('/dashboard/editorial')
      }
    } catch (error) {
      console.error('Error fetching blog:', error)
      toast.error('Failed to load blog')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBlog()
    }
  }, [status, blogSlug])

  // Redirect if not authenticated or doesn't have permission
  if (status === 'loading' || isLoading) {
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

  // Check permissions - only EDITOR, SUPER_ADMIN can edit blogs
  const allowedRoles = ['EDITOR', 'SUPER_ADMIN']
  if (!session?.user?.role || !allowedRoles.includes(session.user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to edit blog posts.</p>
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

  const handleFileSelect = async (file: File) => {
    setIsUploading(true)

    try {
      // Simulate progress
      let progress = 0
      const progressInterval = setInterval(() => {
        progress += 10
        setUploadProgress(Math.min(progress, 90))
      }, 100)

      const uploadedImage = await handleImageUpload(file)
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setFeaturedImage(uploadedImage)

      setTimeout(() => {
        setUploadProgress(0)
        setIsUploading(false)
      }, 500)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
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
      handleFileSelect(files[0])
    }
  }

  const handleRemoveImage = () => {
    setFeaturedImage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replaceAll(/[^a-z0-9 -]/g, '')
      .replaceAll(/\s+/g, '-')
      .replaceAll(/-+/g, '-')
      .trim()
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const slug = generateSlug(formData.title)
      const readTime = calculateReadTime(formData.content)
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)

      const response = await fetch(`/api/blogs/${blogSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          slug,
          readTime,
          featuredImage: featuredImage || null,
          tags: tagsArray
        }),
      })

      if (response.ok) {
        toast.success('Blog updated successfully!')
        router.push('/dashboard/editorial')
      } else {
        const error = await response.json()
        toast.error(`Error: ${error.message || 'Failed to update blog'}`)
      }
    } catch (error) {
      console.error('Error updating blog:', error)
      toast.error('Failed to update blog')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StandardHeader currentPage="Edit Blog" />
      
      <main className="flex-1 bg-gray-50 pt-20 sm:pt-24 pb-4 sm:pb-6 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Blog</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Update blog post details and content.</p>
              </div>
              <Link
                href="/dashboard/editorial"
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Editorial Dashboard
              </Link>
            </div>
          </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                placeholder="e.g., Getting Started with Next.js"
              />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt *
              </label>
              <textarea
                id="excerpt"
                required
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                rows={3}
                placeholder="Brief description of the blog post..."
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                required
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                rows={12}
                placeholder="Write your blog content here..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="SEO title"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., technology, tutorial, nextjs"
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>

            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                id="metaDescription"
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                rows={3}
                placeholder="SEO description"
              />
            </div>

            {/* Featured Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
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
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click()
                  }
                }}
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
                  <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
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
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Image Preview */}
              {featuredImage && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-medium text-gray-700">Featured Image Preview</p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove Image
                    </button>
                  </div>
                  <div className="relative">
                    <img
                      src={featuredImage}
                      alt="Featured preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="rounded border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Featured post</span>
              </label>

              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="DRAFT"
                    checked={formData.status === 'DRAFT'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BlogStatus }))}
                    className="border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Draft</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="PUBLISHED"
                    checked={formData.status === 'PUBLISHED'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BlogStatus }))}
                    className="border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="ARCHIVED"
                    checked={formData.status === 'ARCHIVED'}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as BlogStatus }))}
                    className="border-gray-300 text-green-600 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Archived</span>
                </label>
              </div>
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
                {isSubmitting ? 'Updating...' : 'Update Blog'}
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
