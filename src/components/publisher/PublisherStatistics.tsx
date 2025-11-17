'use client'

import { useEffect, useState } from 'react'

interface PublisherStats {
  reviewCounts: {
    total: number
    pending: number
    approved: number
    published: number
    rejected: number
  }
  recentActivity: {
    id: string
    articleTitle: string
    action: string
    timestamp: string
    status: string
  }[]
  performanceMetrics: {
    reviewsThisWeek: number
    reviewsThisMonth: number
    averageReviewTime: number
    approvalRate: number
  }
}

export default function PublisherStatistics() {
  const [stats, setStats] = useState<PublisherStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/publisher/statistics')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch publisher statistics')
      }
    } catch (error) {
      console.error('Error fetching publisher statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600">Loading statistics...</span>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load statistics.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs sm:text-sm">📋</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Reviews</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.reviewCounts.total}</p>
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
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Pending</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.reviewCounts.pending}</p>
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
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Approved</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.reviewCounts.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs sm:text-sm">🚀</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Published</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.reviewCounts.published}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-md flex items-center justify-center">
                <span className="text-orange-600 font-bold text-xs sm:text-sm">⚡</span>
              </div>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">Avg Time</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.performanceMetrics.averageReviewTime}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Review Activity</h4>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">This Week</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                {stats.performanceMetrics.reviewsThisWeek} reviews
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">This Month</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                {stats.performanceMetrics.reviewsThisMonth} reviews
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Average Review Time</span>
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                {stats.performanceMetrics.averageReviewTime} hours
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Review Status Distribution</h4>
          <div className="space-y-2 sm:space-y-3">
            {Object.entries(stats.reviewCounts).filter(([key]) => key !== 'total').map(([status, count]) => {
              const percentage = stats.reviewCounts.total > 0 ? Math.round((count / stats.reviewCounts.total) * 100) : 0
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'pending': return 'bg-yellow-400'
                  case 'approved': return 'bg-green-400'
                  case 'published': return 'bg-blue-400'
                  case 'rejected': return 'bg-red-400'
                  default: return 'bg-gray-400'
                }
              }
              
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center min-w-0">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mr-2 flex-shrink-0`}></div>
                    <span className="text-xs sm:text-sm text-gray-600 capitalize truncate">{status}</span>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-900 mr-1 sm:mr-2">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity - Responsive */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Recent Review Activity</h3>
        </div>
        <div className="p-4 sm:p-6">
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-4 text-sm sm:text-base">No recent activity</p>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[400px] overflow-y-auto">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 pb-3 sm:pb-0 border-b sm:border-0 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {activity.articleTitle}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {(() => {
                    let statusClasses = 'bg-yellow-100 text-yellow-800'
                    if (activity.status === 'APPROVED') {
                      statusClasses = 'bg-green-100 text-green-800'
                    } else if (activity.status === 'REJECTED') {
                      statusClasses = 'bg-red-100 text-red-800'
                    }
                    return (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClasses} self-start sm:self-auto flex-shrink-0`}>
                        {activity.status}
                      </span>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
