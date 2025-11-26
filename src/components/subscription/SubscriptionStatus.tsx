'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UserSubscription, isSubscriptionActive, getSubscriptionDisplayName, getDaysUntilExpiry } from '@/lib/subscription'

interface SubscriptionStatusProps {
  className?: string
}

export default function SubscriptionStatus({ className = '' }: SubscriptionStatusProps) {
  const router = useRouter()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  const active = isSubscriptionActive(subscription)
  const daysLeft = subscription?.subscriptionEnd ? getDaysUntilExpiry(subscription.subscriptionEnd) : null

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Subscription Status</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            active 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {active ? 'Active' : 'Inactive'}
          </div>
        </div>

        {subscription ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Plan:</span>{' '}
              {getSubscriptionDisplayName(subscription.subscriptionType)}
            </p>
            
            {subscription.subscriptionEnd && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">
                  {active ? 'Expires:' : 'Expired:'}
                </span>{' '}
                {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                {daysLeft !== null && active && (
                  <span className={`ml-2 ${daysLeft <= 7 ? 'text-orange-600' : 'text-gray-500'}`}>
                    ({daysLeft} days left)
                  </span>
                )}
              </p>
            )}

            {!active && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  Your subscription has expired. Upgrade now to continue enjoying premium content.
                </p>
                <button
                  onClick={() => router.push('/subscription')}
                  className="text-xs bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            )}

            {active && daysLeft !== null && daysLeft <= 7 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800 mb-2">
                  Your subscription expires in {daysLeft} days. Renew now to avoid interruption.
                </p>
                <button
                  onClick={() => router.push('/subscription')}
                  className="text-xs bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Renew Now
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">No active subscription</p>
            <button
              onClick={() => router.push('/subscription')}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
