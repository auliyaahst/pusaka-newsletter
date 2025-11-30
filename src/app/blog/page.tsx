'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'

interface Blog {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  featured: boolean
  readTime: number
  publishedAt: string
  status: string
  author: {
    name: string
  }
  featuredImage?: string
  tags: string[]
}

export default function BlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchBlogs()
    }
  }, [status, router])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const data = await response.json()
        setBlogs(data.blogs || [])
      } else {
        console.error('Failed to fetch blogs')
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBlogs = blogs.filter(blog =>
    searchQuery === '' ||
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleBlogClick = (slug: string) => {
    router.push(`/blog/${slug}`)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--accent-blue)' }}></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Standard Header */}
      <StandardHeader currentPage='blog' />

      {/* Main Content Area with padding for fixed header and footer */}
      <main className="flex-1 overflow-y-auto w-full font-peter pt-24 pb-20" style={{backgroundColor: 'var(--accent-cream)'}}>


        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Blog</h1>
                  {/* <p className="text-gray-600 mt-2">Discover our latest insights and stories</p> */}
                </div>

                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search Blogs.."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-52 md:w-64 lg:w-72 pl-10 pr-4 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white font-peter"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Blog Grid */}
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-16">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16l7-4 7 4V4H7z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No blogs found</h3>
                <p className="mt-2 text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms.' : 'No blogs have been published yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id}>
                    <button
                      onClick={() => handleBlogClick(blog.slug)}
                      className="w-full text-left bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <article>
                        {/* Featured Image */}
                        {blog.featuredImage && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={blog.featuredImage}
                              alt={blog.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}

                        <div className="p-6">
                          {/* Tags */}
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {blog.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                            {blog.title}
                          </h2>

                          {/* Excerpt */}
                          {blog.excerpt && (
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {blog.excerpt}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <span>{blog.author.name}</span>
                              {Boolean(blog.readTime) && (
                                <span>{blog.readTime} min read</span>
                              )}
                            </div>
                            {blog.publishedAt && (
                              <span>{formatDate(blog.publishedAt)}</span>
                            )}
                          </div>
                        </div>
                      </article>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Standard Footer */}
      <StandardFooter />
    </div>
  )
}
