'use client'

import { useEffect, useState, useCallback } from 'react'

interface EditorialStats {
  articleCounts: {
    total: number
    draft: number
    underReview: number
    approved: number
    published: number
    rejected: number
  }
  recentActivity: {
    id: string
    title: string
    action: string
    timestamp: string
    status: string
  }[]
  productivityMetrics: {
    articlesThisWeek: number
    articlesThisMonth: number
    averageReviewTime: number
    approvalRate: number
  }
}

export default function EditorialStatistics() {
  const [stats, setStats] = useState<EditorialStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month')

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(`/api/editorial/statistics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch statistics')
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchStatistics()
  }, [fetchStatistics])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'text-gray-600'
      case 'UNDER_REVIEW':
        return 'text-yellow-600'
      case 'APPROVED':
        return 'text-green-600'
      case 'PUBLISHED':
        return 'text-blue-600'
      case 'REJECTED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
        <span className="ml-3 text-gray-600">Loading statistics...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-sm sm:text-base">Failed to load statistics.</p>
        <button 
          onClick={() => fetchStatistics()} 
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Title and Description */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Editorial Statistics</h2>
        <p className="text-sm sm:text-base text-gray-600">View analytics and performance metrics for your content</p>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Dashboard Overview</h3>
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
            {(['week', 'month', 'quarter'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 sm:py-1 rounded text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs sm:text-sm">📄</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Articles</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{stats.articleCounts.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-xs sm:text-sm">⏳</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Pending</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{stats.articleCounts.underReview}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 font-bold text-xs sm:text-sm">✅</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Approval</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{stats.productivityMetrics.approvalRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs sm:text-sm">🚀</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Published</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{stats.articleCounts.published}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Article Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Article Status Distribution</h4>
          <div className="space-y-3">
            {Object.entries(stats.articleCounts).filter(([key]) => key !== 'total').map(([status, count]) => {
              const percentage = stats.articleCounts.total > 0 ? Math.round((count / stats.articleCounts.total) * 100) : 0
              const getStatusColorBg = (status: string) => {
                switch (status) {
                  case 'draft': return 'bg-gray-400'
                  case 'underReview': return 'bg-yellow-400'
                  case 'approved': return 'bg-green-400'
                  case 'published': return 'bg-blue-400'
                  default: return 'bg-red-400'
                }
              }
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={`w-3 h-3 rounded-full mr-2 sm:mr-3 flex-shrink-0 ${getStatusColorBg(status)}`}></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                      {status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Productivity Metrics */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Productivity Metrics</h4>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Articles This Week</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{stats.productivityMetrics.articlesThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Articles This Month</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{stats.productivityMetrics.articlesThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-600">Avg Review Time</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{stats.productivityMetrics.averageReviewTime}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h4 className="text-base sm:text-lg font-medium text-gray-900">Recent Editorial Activity</h4>
        </div>
        
        {stats.recentActivity.length === 0 ? (
          <div className="px-4 sm:px-6 py-6 sm:py-8 text-center">
            <div className="text-gray-400 mb-3">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">No recent activity to display.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-medium text-gray-900 break-words">
                      {activity.title}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      {activity.action}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 sm:ml-4 flex-shrink-0">
                    <span className={`text-xs font-medium ${getStatusColor(activity.status)} self-start`}>
                      {activity.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
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