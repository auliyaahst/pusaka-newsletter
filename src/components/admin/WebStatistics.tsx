'use client'

import { useState, useEffect, useCallback } from 'react'

interface WebStats {
  totalUsers: number
  activeUsers: number
  totalArticles: number
  publishedArticles: number
  totalEditions: number
  publishedEditions: number
  totalRevenue: number
  monthlyRevenue: number
  userGrowth: {
    month: string
    users: number
  }[]
  subscriptionStats: {
    freeTrialUsers: number
    paidSubscriptions: number
    conversionRate: number
  }
  articleStats: {
    drafts: number
    underReview: number
    approved: number
    published: number
  }
  revenueByMonth: {
    month: string
    revenue: number
  }[]
  topPerformingArticles: {
    id: string
    title: string
    readTime: number
    featured: boolean
  }[]
}

export default function WebStatistics() {
  const [stats, setStats] = useState<WebStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('6months')

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/statistics?period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedPeriod])

  useEffect(() => {
    fetchStats()
  }, [selectedPeriod, fetchStats])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load statistics</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Web Statistics</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Analytics and insights for your newsletter platform</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full sm:w-auto"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <span className="text-blue-600 text-base sm:text-lg">👥</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Users</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
              <p className="text-[10px] text-green-600 truncate">
                {stats.activeUsers} active
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg flex-shrink-0">
              <span className="text-green-600 text-base sm:text-lg">📝</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Articles</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatNumber(stats.totalArticles)}</p>
              <p className="text-[10px] text-green-600 truncate">
                {stats.publishedArticles} published
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
              <span className="text-purple-600 text-base sm:text-lg">📰</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Editions</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatNumber(stats.totalEditions)}</p>
              <p className="text-[10px] text-green-600 truncate">
                {stats.publishedEditions} published
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4">
          <div className="flex items-center">
            <div className="p-1.5 sm:p-2 bg-yellow-100 rounded-lg flex-shrink-0">
              <span className="text-yellow-600 text-base sm:text-lg">💰</span>
            </div>
            <div className="ml-2 sm:ml-3 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600">Revenue</p>
              <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-[10px] text-green-600 truncate">
                {formatCurrency(stats.monthlyRevenue)}/mo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">User Growth</h3>
          <div className="space-y-2 sm:space-y-3 max-h-[280px] overflow-y-auto">
            {stats.userGrowth.map((item) => (
              <div key={item.month} className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">{item.month}</span>
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((item.users / Math.max(...stats.userGrowth.map(g => g.users))) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 w-8 sm:w-12 text-right">
                    {formatNumber(item.users)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Revenue by Month</h3>
          <div className="space-y-2 sm:space-y-3 max-h-[280px] overflow-y-auto">
            {stats.revenueByMonth.map((item) => (
              <div key={item.month} className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">{item.month}</span>
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((item.revenue / Math.max(...stats.revenueByMonth.map(r => r.revenue))) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 w-16 sm:w-20 text-right truncate">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription & Article Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Subscription Stats */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Subscription Overview</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Free Trial Users</span>
              <span className="text-base sm:text-lg font-semibold text-gray-900">
                {formatNumber(stats.subscriptionStats.freeTrialUsers)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Paid Subscriptions</span>
              <span className="text-base sm:text-lg font-semibold text-green-600">
                {formatNumber(stats.subscriptionStats.paidSubscriptions)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Conversion Rate</span>
              <span className="text-base sm:text-lg font-semibold text-blue-600">
                {stats.subscriptionStats.conversionRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Article Status */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Article Status Breakdown</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Drafts</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                {stats.articleStats.drafts}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Under Review</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                {stats.articleStats.underReview}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Approved</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {stats.articleStats.approved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600">Published</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                {stats.articleStats.published}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Articles */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Top Performing Articles</h3>
        </div>
        <div className="p-4 sm:p-6 max-h-[400px] overflow-y-auto">
          <div className="space-y-3 sm:space-y-4">
            {stats.topPerformingArticles.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-100 text-blue-600 text-xs sm:text-sm font-medium">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{article.title}</h4>
                    <p className="text-xs text-gray-500">
                      {article.readTime} min read
                      {article.featured && (
                        <span className="ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
