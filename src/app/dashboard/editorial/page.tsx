'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import EditorialEditionManagement from '@/components/editorial/EditorialEditionManagement'
import EditorialArticleManagement from '@/components/editorial/EditorialArticleManagement'
import EditorialReview from '@/components/editorial/EditorialReview'
import EditorialStatistics from '@/components/editorial/EditorialStatistics'

export default function EditorialDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('editions')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'EDITOR') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900"></div>
      </div>
    )
  }

  if (session?.user?.role !== 'EDITOR') {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'editions', label: 'Edition Management', shortLabel: 'Editions', icon: '📰' },
    { id: 'articles', label: 'Article Management', shortLabel: 'Articles', icon: '📝' },
    { id: 'review', label: 'Content Review', shortLabel: 'Review', icon: '👁️' },
    { id: 'statistics', label: 'Editorial Stats', shortLabel: 'Stats', icon: '📊' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 sm:py-3">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-3 text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                <span className="hidden sm:inline">Editorial Dashboard</span>
                <span className="sm:hidden">Editorial</span>
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-1.5 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              
              {/* Compact User info */}
              <div className="hidden sm:flex items-center text-xs text-gray-600">
                <div className="text-right">
                  <div className="font-medium text-xs truncate max-w-24 sm:max-w-32">
                    {session?.user?.name}
                  </div>
                  <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                    {session?.user?.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Compact Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white border-b shadow-lg">
          <div className="px-3 py-2 border-b">
            <div className="text-xs text-gray-600">
              <div className="font-medium text-sm">{session?.user?.name}</div>
              <span className="inline-block mt-1 px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs">
                {session?.user?.role}
              </span>
            </div>
          </div>
          <nav className="px-2 py-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-md text-sm font-medium ${
                  activeTab === tab.id
                    ? 'bg-green-50 text-green-600 border-l-4 border-green-500'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 text-sm">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Compact Desktop Navigation Tabs */}
      <div className="hidden sm:block sticky top-[44px] sm:top-[52px] z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 sm:py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-1.5 text-sm">{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">{tab.shortLabel}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content with adjusted spacing */}
      <main className="max-w-7xl mx-auto py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
        <div className="min-h-[calc(100vh-140px)]">
          {activeTab === 'editions' && <EditorialEditionManagement />}
          {activeTab === 'articles' && <EditorialArticleManagement />}
          {activeTab === 'review' && <EditorialReview />}
          {activeTab === 'statistics' && <EditorialStatistics />}
        </div>
      </main>
    </div>
  )
}