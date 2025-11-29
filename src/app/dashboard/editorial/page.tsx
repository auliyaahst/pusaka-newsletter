'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'
import EditorialEditionManagement from '@/components/editorial/EditorialEditionManagement'
import ArticleManagement from '@/components/editorial/ArticleManagement'
import BlogManagement from '@/components/editorial/BlogManagement'
import ContentReview from '@/components/editorial/ContentReview'
import EditorialStatistics from '@/components/editorial/EditorialStatistics'
import { handleLogout } from '@/lib/logout'

export default function EditorialDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('editions')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'EDITOR' && session?.user?.role !== 'SUPER_ADMIN') {
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

  if (session?.user?.role !== 'EDITOR' && session?.user?.role !== 'SUPER_ADMIN') {
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
    { id: 'editions', label: 'Edition Management', icon: '📰' },
    { id: 'articles', label: 'Article Management', icon: '📝' },
    { id: 'blogs', label: 'Blog Management', icon: '📖' },
    { id: 'review', label: 'Content Review', icon: '👁️' },
    { id: 'statistics', label: 'Editorial Stats', icon: '📊' }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-cream)' }}>
      <StandardHeader currentPage="Editorial Dashboard" />

      {/* Page Title with padding for fixed header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pt-20">
        <h1 className="text-2xl sm:text-3xl font-bold" style={{color: 'var(--accent-blue)'}}>Editorial Dashboard</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-4 sm:space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                style={activeTab === tab.id ? { borderColor: 'var(--accent-blue)' } : {}}
              >
                <span className="mr-1.5 sm:mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>      {/* Content with bottom padding for fixed footer */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16">
        <div className="min-h-[calc(100vh-300px)]">
          {activeTab === 'editions' && <EditorialEditionManagement />}
          {activeTab === 'articles' && <ArticleManagement />}
          {activeTab === 'blogs' && <BlogManagement />}
          {activeTab === 'review' && <ContentReview />}
          {activeTab === 'statistics' && <EditorialStatistics />}
        </div>
      </main>

      <StandardFooter />
    </div>
  )
}