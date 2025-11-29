'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

interface Blog {
  id: string
  title: string
  content?: string
  excerpt: string
  slug: string
  status: BlogStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  featured: boolean
  readTime: number
  metaTitle?: string
  metaDescription?: string
  contentType?: string
  featuredImage?: string
  tags: string[]
  author?: {
    name: string
    email: string
  }
}

export default function BlogManagement() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.relative')) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs || [])
      } else {
        toast.error('Failed to fetch blogs')
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
      toast.error('Failed to fetch blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (blogSlug: string, newStatus: BlogStatus) => {
    setIsUpdating(blogSlug)
    try {
      const response = await fetch(`/api/blogs/${blogSlug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Blog status updated successfully')
        fetchBlogs() // Refresh the list
      } else {
        toast.error('Failed to update blog status')
      }
    } catch (error) {
      console.error('Error updating blog status:', error)
      toast.error('Failed to update blog status')
    } finally {
      setIsUpdating(null)
      setOpenDropdown(null)
    }
  }

  const handleDeleteBlog = async (blogSlug: string) => {
    if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return
    }

    setIsUpdating(blogSlug)
    try {
      const response = await fetch(`/api/blogs/${blogSlug}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Blog deleted successfully')
        fetchBlogs() // Refresh the list
      } else {
        toast.error('Failed to delete blog')
      }
    } catch (error) {
      console.error('Error deleting blog:', error)
      toast.error('Failed to delete blog')
    } finally {
      setIsUpdating(null)
      setOpenDropdown(null)
    }
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesStatus = statusFilter === 'ALL' || blog.status === statusFilter
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadgeColor = (status: BlogStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800'
      case 'ARCHIVED':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-gray-600">Loading blogs...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Title and Button */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Blog Management</h2>
        <p className="text-sm sm:text-base text-gray-600">Create and manage blog posts for your audience</p>
        <button
          onClick={() => router.push('/blog/create')}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 sm:py-2 rounded-lg font-medium flex items-center justify-center sm:justify-start transition-colors duration-200"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Blog Post
        </button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
              {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                    statusFilter === status
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Blogs' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
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

      {/* Blogs List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Blog Posts ({filteredBlogs.length})
          </h3>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
            <p className="text-gray-500 text-sm sm:text-base">No blogs found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150 ${
                blog.status === 'ARCHIVED' ? 'bg-gray-50/50' : ''
              }`}>
                <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <h4 className={`text-base sm:text-lg font-medium ${
                        blog.status === 'ARCHIVED' ? 'text-gray-500' : 'text-gray-900'
                      } break-words`}>
                        {blog.status === 'ARCHIVED' && '📁 '}
                        {blog.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full self-start ${getStatusBadgeColor(blog.status)}`}>
                        {blog.status}
                      </span>
                    </div>
                    
                    {blog.excerpt && (
                      <p className={`text-sm ${
                        blog.status === 'ARCHIVED' ? 'text-gray-400' : 'text-gray-600'
                      } line-clamp-2`}>
                        {blog.excerpt}
                      </p>
                    )}

                    {/* Tags */}
                    {blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm ${
                      blog.status === 'ARCHIVED' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>Created: {new Date(blog.createdAt).toLocaleDateString()}</span>
                      {blog.publishedAt && (
                        <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
                      )}
                      <span>{blog.readTime || 0} min read</span>
                      {blog.author && (
                        <span className="break-all sm:break-normal">By: {blog.author.name}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 sm:ml-4 flex-shrink-0">
                    {/* Actions Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === blog.slug ? null : blog.slug)}
                        className="text-gray-600 hover:text-gray-800 p-1.5 sm:p-1 rounded-full hover:bg-gray-100 transition-colors duration-150"
                        title="More actions"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openDropdown === blog.slug && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            {/* Edit Action */}
                            <button
                              onClick={() => {
                                router.push(`/blog/edit/${blog.slug}`)
                                setOpenDropdown(null)
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Blog
                            </button>
                            
                            {/* Publish/Draft Actions */}
                            {blog.status !== 'PUBLISHED' && (
                              <button
                                onClick={() => {
                                  handleStatusChange(blog.slug, 'PUBLISHED')
                                }}
                                disabled={isUpdating === blog.slug}
                                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {isUpdating === blog.slug ? 'Publishing...' : 'Publish Blog'}
                              </button>
                            )}
                            
                            {blog.status === 'PUBLISHED' && (
                              <button
                                onClick={() => {
                                  handleStatusChange(blog.slug, 'DRAFT')
                                }}
                                disabled={isUpdating === blog.slug}
                                className="flex items-center w-full px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                {isUpdating === blog.slug ? 'Moving to Draft...' : 'Move to Draft'}
                              </button>
                            )}

                            {/* Archive Action */}
                            {blog.status === 'ARCHIVED' ? (
                              <button
                                onClick={() => {
                                  handleStatusChange(blog.slug, 'DRAFT')
                                }}
                                disabled={isUpdating === blog.slug}
                                className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l3-3 3 3M7 8l3 3 3-3" />
                                </svg>
                                {isUpdating === blog.slug ? 'Unarchiving...' : 'Unarchive Blog'}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  handleStatusChange(blog.slug, 'ARCHIVED')
                                }}
                                disabled={isUpdating === blog.slug}
                                className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                              >
                                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l4 4 4-4" />
                                </svg>
                                {isUpdating === blog.slug ? 'Archiving...' : 'Archive Blog'}
                              </button>
                            )}
                            
                            {/* Delete Action */}
                            <button
                              onClick={() => {
                                handleDeleteBlog(blog.slug)
                              }}
                              disabled={isUpdating === blog.slug}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              {isUpdating === blog.slug ? 'Deleting...' : 'Delete Blog'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800 p-1.5 sm:p-1 rounded-full hover:bg-blue-50 transition-colors duration-150"
                      title="View Blog"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
