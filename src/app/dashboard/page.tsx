'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  featured: boolean
  readTime: number
  publishedAt: string
}

interface Edition {
  id: string
  title: string
  description: string
  publishDate: string
  editionNumber: number
  articles: Article[]
  _count: {
    articles: number
  }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false)
  const [loginTime, setLoginTime] = useState<number | null>(null)
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFloatingSearch, setShowFloatingSearch] = useState(false)
  const [showFloatingIcon, setShowFloatingIcon] = useState(false)
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null)

  // Helper function to get edition display text
  const getEditionDisplayText = (edition: Edition): string => {
    if (!edition.publishDate) return 'Newsletter Edition'
    
    let editionLabel: string
    if (edition.editionNumber === 1) {
      editionLabel = 'First Edition'
    } else if (edition.editionNumber === 2) {
      editionLabel = 'Second Edition'
    } else if (edition.editionNumber) {
      editionLabel = `Edition ${edition.editionNumber}`
    } else {
      editionLabel = 'Edition'
    }
    
    const dateString = new Date(edition.publishDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
    
    return `${editionLabel}, ${dateString}`
  }

  // Helper function to extract summary from article content
  const getArticleSummary = (article: Article): string => {
    if (article.excerpt && article.excerpt.trim()) {
      return article.excerpt
    }
    
    if (!article.content) return ''
    
    // Extract text from HTML content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = article.content
    
    // Look for Executive Summary section
    const strongTags = tempDiv.querySelectorAll('strong')
    for (const strong of strongTags) {
      if (strong.textContent?.toLowerCase().includes('executive summary')) {
        // Get the content after Executive Summary
        let summaryContent = ''
        let nextElement = strong.parentElement?.nextElementSibling
        const bulletPoints: string[] = []
        
        while (nextElement && bulletPoints.length < 4) {
          if (nextElement.tagName === 'UL') {
            const listItems = nextElement.querySelectorAll('li')
            for (const li of listItems) {
              const text = li.textContent?.trim()
              if (text && bulletPoints.length < 4) {
                bulletPoints.push(text)
              }
            }
            break
          } else if (nextElement.tagName === 'P' && nextElement.textContent?.trim()) {
            summaryContent = nextElement.textContent.trim()
            break
          }
          nextElement = nextElement.nextElementSibling
        }
        
        if (bulletPoints.length > 0) {
          return bulletPoints.join(' • ')
        }
        if (summaryContent) {
          return summaryContent
        }
      }
    }
    
    // Fallback: get first meaningful paragraph
    const paragraphs = tempDiv.querySelectorAll('p')
    for (const p of paragraphs) {
      const text = p.textContent?.trim()
      if (text && text.length > 50) {
        return text.length > 200 ? text.substring(0, 200) + '...' : text
      }
    }
    
    return ''
  }

  const fetchEditions = useCallback(async () => {
    try {
      const response = await fetch('/api/editions')
      if (response.ok) {
        const data = await response.json()
        setEditions(data.editions)
        // Set the first (latest) edition as default if no edition is selected
        if (data.editions.length > 0 && !selectedEditionId) {
          setSelectedEditionId(data.editions[0].id)
        }
      } else {
        console.error('Failed to fetch editions')
      }
    } catch (error) {
      console.error('Error fetching editions:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedEditionId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchEditions()
    }
  }, [status, router, fetchEditions])

  const handleArticleClick = (slug: string) => {
    router.push(`/article/${slug}`)
  }

  const filteredEditions = editions
    .filter(edition => !selectedEditionId || edition.id === selectedEditionId)
    .map(edition => ({
      ...edition,
      articles: edition.articles.filter(article =>
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getArticleSummary(article).toLowerCase().includes(searchQuery.toLowerCase())
      )
    }))
    .filter(edition => 
      searchQuery === '' || 
      edition.articles.length > 0 ||
      edition.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

  // Set login time when session starts
  useEffect(() => {
    if (session && status === 'authenticated' && !loginTime) {
      const now = Date.now()
      setLoginTime(now)
      console.log('Login time set:', new Date(now).toLocaleTimeString())
    }
  }, [session, status, loginTime])

  // Check session expiration based on login time
  useEffect(() => {
    if (loginTime && session && status === 'authenticated') {
      const checkSessionTimeout = () => {
        const now = Date.now()
        const sessionDuration = now - loginTime
        const timeoutDuration = 15 * 60 * 1000 // 15 minutes in milliseconds

        console.log(`Session check: ${sessionDuration / 1000}s elapsed, timeout at ${timeoutDuration / 1000}s`)
        
        if (sessionDuration > timeoutDuration) {
          console.log('Session expired after', sessionDuration / 1000, 'seconds')
          setShowSessionExpiredModal(true)
          return
        }
        
        // Also check with NextAuth
        fetch('/api/auth/session', { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (!data?.user) {
              console.log('NextAuth session expired')
              setShowSessionExpiredModal(true)
            }
          })
          .catch(error => {
            console.error('Session check failed:', error)
            setShowSessionExpiredModal(true)
          })
      }

      // Check immediately
      checkSessionTimeout()
      
      // Set up interval to check every 5 seconds for testing
      const interval = setInterval(checkSessionTimeout, 5000)

      return () => clearInterval(interval)
    }
  }, [loginTime, session, status])

  // Scroll detection for floating search icon visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      // Show floating icon when scrolled past the edition header (approximately 150px)
      // This should be when the edition header with search bar is no longer visible
      const shouldShow = scrollTop > 150
      setShowFloatingIcon(shouldShow)
    }

    // Initial check
    handleScroll()
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSessionExpiredLogin = async () => {
    setShowSessionExpiredModal(false)
    await signOut({ callbackUrl: '/login' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with exact blue color from image - Made sticky with enhanced support */}
      <header 
        className="sticky top-0 z-50 text-white shadow-md transition-shadow duration-200" 
        style={{
          backgroundColor: 'var(--accent-blue)', 
          position: '-webkit-sticky' /* Safari support */
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Logo from logo_title.svg */}
              <div className="h-12 flex items-center">
                <Image 
                  src="/logo_title.svg" 
                  alt="The Pusaka Newsletter Logo" 
                  width={150}
                  height={64}
                  className="h-16 w-auto"
                  style={{
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Navigation menu icon with dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white hover:text-blue-200 p-1"
                >
                  <svg className="w-8 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-600">{session.user?.email}</p>
                      {session.user?.role && (
                        <p className="text-xs text-blue-600 font-medium mt-1">Role: {session.user.role}</p>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      {session.user?.role === 'ADMIN' && (
                        <button
                          onClick={() => router.push('/dashboard/admin')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mb-2"
                        >
                          Admin Dashboard
                        </button>
                      )}
                      {session.user?.role === 'EDITOR' && (
                        <button
                          onClick={() => router.push('/dashboard/editorial')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium mb-2"
                        >
                          Editorial Dashboard
                        </button>
                      )}
                      {session.user?.role === 'PUBLISHER' && (
                        <button
                          onClick={() => router.push('/dashboard/publisher')}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium mb-2"
                        >
                          Publisher Dashboard
                        </button>
                      )}
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full font-peter" style={{backgroundColor: 'var(--accent-cream)'}}>
        {/* Edition Navigation */}
        {editions.length > 1 && (
          <div className="border-b border-gray-300 shadow-sm" style={{backgroundColor: 'var(--accent-cream)'}}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-2">
                <p className="text-sm text-gray-600 font-medium">Choose Edition:</p>
              </div>
              <nav className="flex space-x-8 overflow-x-auto pb-4">
                {editions.map((edition) => (
                  <button
                    key={edition.id}
                    onClick={() => setSelectedEditionId(edition.id)}
                    className={`py-3 px-4 border-b-3 font-medium text-sm whitespace-nowrap transition-all duration-200 rounded-t-lg ${
                      selectedEditionId === edition.id
                        ? 'border-blue-600 text-blue-600 bg-white shadow-sm'
                        : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-white/50 hover:shadow-sm'
                    }`}
                  >
                    <span className="font-semibold">{edition.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Edition Header - Made non-sticky */}
        <div className="px-4 sm:px-6 lg:px-8 py-4" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <p className="text-gray-800 text-sm font-medium">
                {filteredEditions.length > 0 
                  ? getEditionDisplayText(filteredEditions[0])
                  : 'Newsletter Edition'
                }
              </p>
              <div className="relative w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Article Keywords.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-52 md:w-64 lg:w-72 px-4 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white font-peter"
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
        </div>        {/* Newsletter Content */}
        <div className="px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading newsletter content...</p>
              </div>
            ) : (
              <>
                {filteredEditions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No newsletter content available.</p>
                  </div>
                ) : (
                  filteredEditions.map((edition) => (
                <div key={edition.id} className="mb-12">
                  {/* Main Headline - Dynamic based on edition */}
                  <div className="mb-8">
                    {edition.title === 'SHIFTING TO ELECTRIC VEHICLE' ? (
                      <>
                        <h1 className="text-5xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                          SHIFTING TO
                        </h1>
                        <h2 className="text-3xl font-bold text-black">
                          ELECTRIC VEHICLE
                        </h2>
                      </>
                    ) : (
                      <>
                        <h1 className="text-5xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                          {edition.title}
                        </h1>
                      </>
                    )}
                  </div>

                  {/* Edition Contents */}
                  <div className="">
                    {/* <h3 className="text-xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                      Edition Contents ({edition._count.articles} articles)
                    </h3> */}
                    <h3 className="text-xl font-bold mb-2" style={{color: 'var(--accent-blue)'}}>
                      Edition Contents
                    </h3>
                    <div className="space-y-6">
                      {edition.articles.map((article) => (
                        <div key={article.id} className="border-b border-gray-400 pb-4">
                          <button
                            onClick={() => handleArticleClick(article.slug)}
                            className="text-left w-full group hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-bold text-xl mb-2 underline group-hover:text-blue-700 transition-colors" 
                                    style={{color: 'var(--accent-blue)'}}>
                                  {article.title}
                                  {article.featured && (
                                    <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                                      Featured
                                    </span>
                                  )}
                                </h4>
                                <p className="text-black text-xl leading-relaxed">
                                  {getArticleSummary(article)}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                  <span>{article.readTime} min read</span>
                                  <span>
                                    {new Date(article.publishedAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" 
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                ))
                )}
              </>
            )}            {/* EV Illustration - simplified line art matching the image */}
            <div className="flex justify-center items-end space-x-12 my-12">
              {/* Car illustration */}
              <div className="flex items-center justify-center">
                <svg className="w-32 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 120 60" strokeWidth="2">
                  <path d="M15 45 L20 25 L30 25 L35 20 L85 20 L90 25 L100 25 L105 45 L100 45 L100 50 L95 50 L95 45 L25 45 L25 50 L20 50 L20 45 Z"/>
                  <circle cx="30" cy="45" r="5" fill="none"/>
                  <circle cx="90" cy="45" r="5" fill="none"/>
                  <path d="M35 25 L85 25"/>
                  <path d="M45 25 L45 35"/>
                  <path d="M75 25 L75 35"/>
                </svg>
              </div>
              
              {/* Charging station */}
              <div className="flex items-center justify-center">
                <svg className="w-16 h-24 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 50 80" strokeWidth="2">
                  <rect x="20" y="10" width="10" height="60" rx="3"/>
                  <path d="M25 20 L25 30"/>
                  <circle cx="25" cy="35" r="3" fill="currentColor"/>
                  <path d="M25 40 L25 50"/>
                  <rect x="5" y="60" width="40" height="8" rx="2"/>
                  <path d="M15 60 L35 60"/>
                </svg>
              </div>
              
              {/* Battery */}
              <div className="flex items-center justify-center">
                <svg className="w-24 h-14 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 80 50" strokeWidth="2">
                  <rect x="10" y="15" width="55" height="20" rx="3"/>
                  <rect x="65" y="20" width="8" height="10" rx="2"/>
                  <path d="M18 25 L28 25"/>
                  <path d="M35 25 L45 25"/>
                  <path d="M52 25 L57 25"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-white py-4 px-8" style={{backgroundColor: 'var(--accent-blue)'}}>
          <p className="text-center text-sm">© The Pusaka Newsletter</p>
        </footer>
      </main>

      {/* Session Expired Modal */}
      {showSessionExpiredModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg 
                  className="h-6 w-6 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Session Expired
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your session has expired for security reasons. Please log in again to continue using the dashboard.
              </p>
              <button
                onClick={handleSessionExpiredLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                style={{backgroundColor: 'var(--accent-blue)'}}
              >
                Login Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Search Icon - Only visible when scrolled down */}
      {showFloatingIcon && (
        <button
          onClick={() => setShowFloatingSearch(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transform transition-all duration-500 ease-in-out hover:scale-110 animate-in fade-in slide-in-from-bottom-4"
          style={{backgroundColor: 'var(--accent-blue)'}}
          aria-label="Search articles"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      {/* Floating Search Modal */}
      {showFloatingSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Search Articles</h3>
                <button
                  onClick={() => setShowFloatingSearch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Article Keywords.."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white font-peter"
                  autoFocus
                />
                <div className="absolute right-3 top-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {searchQuery && (
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {filteredEditions.reduce((total, edition) => total + edition.articles.length, 0)} articles found
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setShowFloatingSearch(false)
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowFloatingSearch(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowFloatingSearch(false)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
                  style={{backgroundColor: 'var(--accent-blue)'}}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
