'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface StandardHeaderProps {
  readonly currentPage: string
  readonly onMenuToggle?: (isOpen: boolean) => void
}

interface Edition {
  id: string
  title: string
  description: string
  publishDate: string
  editionNumber: number
  coverImage: string | null
  _count: {
    articles: number
  }
}

export default function StandardHeader({ currentPage, onMenuToggle }: StandardHeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditionMenuOpen, setIsEditionMenuOpen] = useState(false)
  const [editions, setEditions] = useState<Edition[]>([])

  // Notify parent when menu state changes
  useEffect(() => {
    onMenuToggle?.(isMenuOpen)
  }, [isMenuOpen, onMenuToggle])

  useEffect(() => {
    const fetchEditions = async () => {
      try {
        const response = await fetch('/api/editions')
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched editions data:', data)
          setEditions(data.editions || [])
        }
      } catch (error) {
        console.error('Error fetching editions:', error)
      }
    }
    
    if (session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_ADMIN') {
      fetchEditions()
    }
  }, [session?.user?.role])

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      if (isMenuOpen && !target.closest('[data-dropdown="profile"]')) {
        setIsMenuOpen(false)
      }
      
      if (isEditionMenuOpen && !target.closest('[data-dropdown="edition"]')) {
        setIsEditionMenuOpen(false)
      }
    }

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
        setIsEditionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isMenuOpen, isEditionMenuOpen])

  const handleEditionSelect = (editionId: string) => {
    console.log('🔥 handleEditionSelect START - editionId:', editionId)
    
    const targetEdition = editions.find(e => e.id === editionId)
    console.log('🔥 Target edition found:', targetEdition?.title, targetEdition?.id)
    
    if (!targetEdition) {
      console.error('🔥 Edition not found for ID:', editionId)
      return
    }
    
    setIsEditionMenuOpen(false)
    setIsMenuOpen(false)
    
    // Navigate to the dashboard with the selected edition parameter
    router.push(`/dashboard?edition=${editionId}`, { scroll: false })
    
    console.log('🔥 handleEditionSelect END - navigating to edition:', editionId)
  }

  // Debug effect
  useEffect(() => {
    console.log('Debug - User role:', session?.user?.role)
    console.log('Debug - Editions length:', editions.length)
    console.log('Debug - Should show editions?', (session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_ADMIN') && editions.length > 0)
  }, [session?.user?.role, editions])

  return (
    <header className="sticky top-0 left-0 right-0 flex-shrink-0 text-white shadow-md" style={{backgroundColor: 'var(--accent-blue)'}}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Logo from logo_title.svg */}
            <div className="h-12 flex items-center">
              <Link href="/dashboard">
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
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Consolidated Profile Dropdown with Hamburger Menu */}
            <div className="relative" data-dropdown="profile">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200"
              >
                {/* Hamburger Menu Icon */}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Consolidated Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto transform origin-top-right animate-in fade-in scale-in-95 duration-200">
                  {/* Profile Section */}
                  <div className="p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
                        <p className="text-xs text-gray-600 truncate">{session?.user?.email}</p>
                        {session?.user?.role && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                            {session.user.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Profile Item */}
                    <button
                      onClick={() => {
                        router.push('/profile')
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </button>

                    {/* Blog Item */}
                    <button
                      onClick={() => {
                        router.push('/blog')
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16l7-4 7 4V4H7z" />
                      </svg>
                      <span>Blog</span>
                    </button>

                    {/* Dashboard Item */}
                    <button
                      onClick={() => {
                        router.push('/dashboard')
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z" />
                      </svg>
                      <span>Dashboard</span>
                    </button>

                    {/* Role-based Dashboard Items */}
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          router.push('/dashboard/admin')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Admin Dashboard</span>
                      </button>
                    )}

                    {(session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          router.push('/dashboard/editorial')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Editorial Dashboard</span>
                      </button>
                    )}

                    {(session?.user?.role === 'PUBLISHER' || session?.user?.role === 'SUPER_ADMIN') && (
                      <button
                        onClick={() => {
                          router.push('/dashboard/publisher')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-13-3v9a2 2 0 002 2h9a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                        </svg>
                        <span>Publisher Dashboard</span>
                      </button>
                    )}

                    {/* Edition Selection - Only for EDITOR and SUPER_ADMIN */}
                    {(session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_ADMIN') && editions.length > 0 && (
                      <div className="border-t border-gray-200 mt-2 pt-2" data-dropdown="edition">
                        <div className="relative">
                          <button
                            onClick={() => setIsEditionMenuOpen(!isEditionMenuOpen)}
                            className="w-full flex items-center justify-between text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                          >
                            <div className="flex items-center space-x-3">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              <span>Editions</span>
                            </div>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isEditionMenuOpen ? 'rotate-180' : ''}`} 
                                 fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          {/* Edition Submenu */}
                          {isEditionMenuOpen && (
                            <div className="bg-gray-50 max-h-[300px] overflow-y-auto">
                              {editions.map((edition) => (
                                <button
                                  key={edition.id}
                                  onClick={() => {
                                    console.log('🔥 EDITION CLICKED:', edition.title, edition.id)
                                    handleEditionSelect(edition.id)
                                  }}
                                  className="w-full px-8 py-3 text-left hover:bg-gray-100 transition-colors duration-150 text-sm text-gray-700"
                                  type="button"
                                >
                                  <div className="truncate font-medium">{edition.title}</div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                    <span>
                                      {new Date(edition.publishDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                    <span>•</span>
                                    <span>{edition._count?.articles || 0} articles</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Sign Out */}
                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          const baseUrl = globalThis.window ? globalThis.window.location.origin : ''
                          signOut({ callbackUrl: `${baseUrl}/login` })
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-red-600 hover:bg-red-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}