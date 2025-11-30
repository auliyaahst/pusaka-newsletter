'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  duration: number
  features: string[]
  popular?: boolean
  badge?: string
  description?: string
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free_trial',
    name: 'Free Trial',
    price: 0,
    currency: 'IDR',
    duration: 90, // 3 months
    description: 'Try our premium content for free',
    badge: '3 Months Free',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Basic support',
      'Download PDF articles',
      'Mobile app access',
      'No commitment - cancel anytime'
    ]
  },
  {
    id: 'monthly',
    name: 'Starter',
    price: 99000, // IDR 99,000
    currency: 'IDR',
    duration: 30,
    description: 'Perfect for trying out our premium content',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Basic support',
      'Download PDF articles',
      'Mobile app access'
    ]
  },
  {
    id: 'quarterly',
    name: 'Popular',
    price: 249000, // IDR 249,000 (save 16%)
    currency: 'IDR',
    duration: 90,
    popular: true,
    badge: 'Most Popular',
    description: 'Best value for regular readers',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Priority support',
      'Download PDF articles',
      'Mobile app access',
      'Early access to new content'
    ]
  },
  {
    id: 'annually',
    name: 'Premium',
    price: 899000, // IDR 899,000 (save 24%)
    currency: 'IDR',
    duration: 365,
    badge: 'Best Value',
    description: 'Maximum savings for committed readers',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Premium support',
      'Download PDF articles',
      'Mobile app access',
      'Early access to new content',
      'Exclusive webinars',
      'Direct author contact'
    ]
  }
]

interface UserSubscription {
  subscriptionType: string
  subscriptionEnd: string | null
  isActive: boolean
  trialUsed: boolean
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchUserSubscription()
    }
  }, [status, router])

  // Refresh data when user returns to the page (e.g., after payment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && status === 'authenticated') {
        fetchUserSubscription()
      }
    }

    const handleFocus = () => {
      if (status === 'authenticated') {
        fetchUserSubscription()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [status])

  const fetchUserSubscription = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/user/subscription?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        setUserSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateSavings = (plan: SubscriptionPlan) => {
    if (plan.id === 'free_trial') {
      return { amount: 0, percentage: 0 }
    }
    
    const monthlyPrice = 99000
    const totalMonthlyPrice = monthlyPrice * (plan.duration / 30)
    const savings = totalMonthlyPrice - plan.price
    const percentage = (savings / totalMonthlyPrice) * 100
    return { amount: savings, percentage }
  }

  const handleSubscribe = async (planId: string) => {
    if (!session?.user?.email) return

    setLoading(true)

    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: planId,
          userEmail: session.user.email,
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        // Redirect to Xendit payment page with all payment methods
        window.location.href = data.paymentUrl
      } else {
        toast.error(data.error || 'Failed to create payment')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error('Failed to create subscription')
    } finally {
      setLoading(false)
    }
  }

  const isCurrentPlan = (planId: string) => {
    if (!userSubscription) return false
    return userSubscription.subscriptionType === planId.toUpperCase()
  }

  const isSubscriptionActive = () => {
    if (!userSubscription) return false
    if (!userSubscription.isActive) return false
    if (!userSubscription.subscriptionEnd) return true
    return new Date(userSubscription.subscriptionEnd) > new Date()
  }

  // Filter plans based on trial usage
  const getAvailablePlans = () => {
    if (!userSubscription) return subscriptionPlans
    
    // If user has already used trial, exclude free trial option
    if (userSubscription.trialUsed) {
      return subscriptionPlans.filter(plan => plan.id !== 'free_trial')
    }
    
    return subscriptionPlans
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Fixed Header with exact blue color from image */}
      <StandardHeader currentPage="Subscription" />

      {/* Main Content Area with padding for fixed header and footer */}
      <main className="flex-1 overflow-y-auto w-full font-peter pb-20" style={{backgroundColor: 'var(--accent-cream)'}}>

        {/* Subscription Page Title */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pt-28">
          <h1 className="text-2xl sm:text-3xl font-bold" style={{color: 'var(--accent-blue)'}}>Choose Your Plan</h1>
          
        </div>

        {/* Subscription Plans */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="max-w-6xl mx-auto">

        {/* Current Subscription Status */}
        {/* {userSubscription && isSubscriptionActive() && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-2xl font-bold text-green-800">You have an active subscription!</h2>
              </div>
              <p className="text-green-700 mb-4">
                Your {userSubscription.subscriptionType.toLowerCase()} plan is currently active.
                {userSubscription.subscriptionEnd && (
                  <span> Expires on {new Date(userSubscription.subscriptionEnd).toLocaleDateString()}.</span>
                )}
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )} */}

            <div className={`grid gap-8 ${
              getAvailablePlans().length === 4 
                ? 'grid-cols-1 lg:grid-cols-4' 
                : getAvailablePlans().length === 3 
                ? 'grid-cols-1 lg:grid-cols-3' 
                : 'grid-cols-1 lg:grid-cols-2'
            }`}>
              {getAvailablePlans().map((plan) => {
            const savings = calculateSavings(plan)
            const isCurrent = isCurrentPlan(plan.id)
            
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden relative transform transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-blue-500 lg:scale-110' : ''
                }`}
              >
                {plan.badge && (
                  <div className={`absolute top-0 left-0 right-0 text-white text-center py-3 text-sm font-bold ${
                    plan.popular ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className={`p-8 ${plan.badge ? 'pt-16' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </div>
                  
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.id === 'free_trial' ? 'Free' : formatCurrency(plan.price)}
                      </span>
                      {plan.id !== 'free_trial' && (
                        <span className="text-gray-600 ml-2 text-lg">
                          /{plan.duration === 30 ? 'month' : plan.duration === 90 ? '3 months' : 'year'}
                        </span>
                      )}
                    </div>
                    
                    {plan.id === 'free_trial' ? (
                      <p className="text-green-600 text-sm mt-2 font-medium">
                        3 months completely free • No credit card required
                      </p>
                    ) : plan.id !== 'monthly' && savings.amount > 0 ? (
                      <div className="mt-3">
                        <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full">
                          <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          <span className="text-green-800 text-sm font-medium">
                            Save {formatCurrency(savings.amount)} ({savings.percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Features */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5">
                          <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || isCurrent}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.id === 'free_trial'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black shadow-lg hover:shadow-xl'
                    } ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
                    }`}
                  >
                    {isCurrent ? (
                      '✓ Current Plan'
                    ) : loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline-block mr-2"></div>
                        Processing...
                      </>
                    ) : plan.id === 'free_trial' ? (
                      'Start Free Trial'
                    ) : (
                      <>Choose {plan.name}</>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <StandardFooter />
    </div>
  )
}
