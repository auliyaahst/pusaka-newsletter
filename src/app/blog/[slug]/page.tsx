'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'

interface Blog {
  id: string
  title: string
  content: string
  excerpt: string
  slug: string
  status: string
  publishedAt: string
  metaTitle?: string
  metaDescription?: string
  featuredImage?: string
  readTime?: number
  tags: string[]
  author: {
    name: string
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (params.slug) {
        fetchBlog(params.slug as string)
      }
    }
  }, [status, params.slug, router])

  const fetchBlog = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/blogs/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setBlog(data.blog)
      } else {
        setError('Blog post not found')
      }
    } catch (err) {
      console.error('Error fetching blog:', err)
      setError('Failed to load blog post')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--accent-blue)' }}></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/blog')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Blog
          </button>
        </div>
      </div>
    )
  }

  if (!session || !blog) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Back Button */}
      <button
        onClick={() => router.push('/blog')}
        className="fixed left-6 top-24 z-40 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
        style={{backgroundColor: 'var(--accent-blue)'}}
        title="Back to Blog"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      {/* Fixed Header */}
      <StandardHeader />

      {/* Main Content with padding for fixed header */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pt-24 pb-20">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Featured Image */}
          {blog.featuredImage && (
            <div className="aspect-video overflow-hidden">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 sm:p-12">
            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {blog.author.name?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{blog.author.name}</p>
                  <p className="text-gray-600 text-sm">Author</p>
                </div>
              </div>
              <div className="flex flex-col sm:text-right">
                <p className="text-gray-600 text-sm">
                  {formatDate(blog.publishedAt)}
                </p>
                {Boolean(blog.readTime) && (
                  <p className="text-gray-500 text-sm">
                    {blog.readTime} min read
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>

        {/* Back to Blog Button */}
        {/* <div className="text-center mt-12">
          <button
            onClick={() => router.push('/blog')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </button>
        </div> */}
      </main>

      {/* Fixed Footer */}
      <StandardFooter />
    </div>
  )
}
