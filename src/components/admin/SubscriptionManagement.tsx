'use client'

import { useState, useEffect } from 'react'

interface SubscriptionData {
  id: string
  user: {
    id: string
    name: string | null
    email: string
  }
  subscriptionType: 'FREE_TRIAL' | 'MONTHLY' | 'QUARTERLY' | 'HALF_YEARLY' | 'ANNUALLY'
  subscriptionStart: string | null
  subscriptionEnd: string | null
  isActive: boolean
  createdAt: string
  payments: {
    id: string
    amount: number
    status: string
    createdAt: string
  }[]
}

interface SubscriptionStats {
  totalSubscriptions: number
  activeSubscriptions: number
  expiredSubscriptions: number
  freeTrialUsers: number
  monthlyRevenue: number
  subscriptionsByType: {
    [key: string]: number
  }
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [stats, setStats] = useState<SubscriptionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchSubscriptions()
    fetchStats()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data)
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching subscription stats:', error)
    }
  }

  const handleUpdateSubscription = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchSubscriptions()
        await fetchStats()
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Failed to update subscription')
    }
  }

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         sub.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || sub.subscriptionType === filterType
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && sub.isActive) ||
                         (filterStatus === 'inactive' && !sub.isActive)

    return matchesSearch && matchesType && matchesStatus
  })

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'ANNUALLY': return 'bg-green-100 text-green-800'
      case 'HALF_YEARLY': return 'bg-blue-100 text-blue-800'
      case 'QUARTERLY': return 'bg-yellow-100 text-yellow-800'
      case 'MONTHLY': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(amount)
  }

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false
    return new Date(endDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
        <p className="text-gray-600 mt-1">Monitor and manage user subscriptions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">⏰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{stats.expiredSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center space-x-4 space-y-2">
        <div className="flex-1 min-w-64">
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="FREE_TRIAL">Free Trial</option>
          <option value="MONTHLY">Monthly</option>
          <option value="QUARTERLY">Quarterly</option>
          <option value="HALF_YEARLY">Half Yearly</option>
          <option value="ANNUALLY">Annually</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.user.name || 'No name'}
                    </div>
                    <div className="text-sm text-gray-500">{subscription.user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionColor(subscription.subscriptionType)}`}>
                    {subscription.subscriptionType.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {subscription.subscriptionStart && subscription.subscriptionEnd ? (
                    <div>
                      <div>{new Date(subscription.subscriptionStart).toLocaleDateString()}</div>
                      <div className="text-xs">to {new Date(subscription.subscriptionEnd).toLocaleDateString()}</div>
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => {
                    if (subscription.isActive && !isExpired(subscription.subscriptionEnd)) {
                      return (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )
                    } else if (isExpired(subscription.subscriptionEnd)) {
                      return (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Expired
                        </span>
                      )
                    } else {
                      return (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )
                    }
                  })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscription.payments.length > 0 ? (
                    formatCurrency(subscription.payments.reduce((sum, payment) => sum + payment.amount, 0))
                  ) : (
                    'No payments'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      const newEndDate = new Date()
                      newEndDate.setMonth(newEndDate.getMonth() + 1)
                      handleUpdateSubscription(subscription.user.id, {
                        subscriptionEnd: newEndDate.toISOString(),
                        isActive: true
                      })
                    }}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Extend
                  </button>
                  <button
                    onClick={() => handleUpdateSubscription(subscription.user.id, { isActive: false })}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No subscriptions found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Subscription Type Breakdown */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(stats.subscriptionsByType).map(([type, count]) => (
              <div key={type} className="text-center">
                <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getSubscriptionColor(type)} mb-2`}>
                  {type.replace('_', ' ')}
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500">
                  {((count / stats.totalSubscriptions) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
