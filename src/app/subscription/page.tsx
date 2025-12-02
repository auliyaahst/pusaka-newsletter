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

// All subscription plans - always shown
const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 99000, // IDR 99,000
    currency: 'IDR',
    duration: 30,
    description: 'Full access billed monthly',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Priority support',
      'Download PDF articles',
      'Mobile app access',
      'Cancel anytime'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 990000, // IDR 990,000 (2 months free)
    currency: 'IDR',
    duration: 365,
    description: 'Full access billed annually',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Priority support',
      'Download PDF articles',
      'Mobile app access',
      'Save 2 months (17% off)'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 249000, // IDR 249,000
    currency: 'IDR',
    duration: 90,
    description: 'Full access billed quarterly',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Priority support',
      'Download PDF articles',
      'Mobile app access',
      'Save on 3-month plan'
    ]
  }
]

interface UserSubscription {
  subscriptionType: string
  subscriptionEnd: string | null
  isActive: boolean
  trialUsed: boolean
  isVerified: boolean
  emailVerified: Date | null
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly')

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

  const handleSkipRegistration = async () => {
    if (!session?.user?.email) {
      router.push('/dashboard')
      return
    }

    try {
      // Send verification email
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      })

      if (response.ok) {
        // Redirect to a verification sent page
        router.push('/verify-email-sent')
      } else {
        toast.error('Failed to send verification email')
      }
    } catch (error) {
      console.error('Error sending verification email:', error)
      toast.error('An error occurred')
    }
  }

  // Check if a plan is highlighted based on selected tab
  const isPlanHighlighted = (planId: string) => {
    return planId === selectedTab
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Fixed Header */}
      <StandardHeader currentPage="Subscription" />

      {/* Main Content Area with padding for fixed header and footer */}
      <main className="flex-1 overflow-y-auto w-full font-peter pb-20" style={{backgroundColor: 'var(--accent-cream)'}}>

        {/* Subscription Page Title */}
        <div className="text-center pt-28 pb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--accent-blue)' }}>
            Choose your plan
          </h1>
          
          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedTab('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'monthly'
                  ? 'bg-gray-800 text-white'
                  : 'bg-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedTab('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'yearly'
                  ? 'bg-gray-800 text-white'
                  : 'bg-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setSelectedTab('quarterly')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === 'quarterly'
                  ? 'bg-gray-800 text-white'
                  : 'bg-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="px-4 sm:px-6 lg:px-8 pb-8" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="max-w-5xl mx-auto">

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {subscriptionPlans.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id)
            const isHighlighted = isPlanHighlighted(plan.id)
            
            return (
              <div
                key={plan.id}
                className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
                  isHighlighted 
                    ? 'bg-gray-900 text-white transform scale-105' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <div className="p-8">
                  {/* Plan Title */}
                  <h3 className={`text-xl font-bold text-center mb-2 ${
                    isHighlighted ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.name}
                  </h3>
                  
                  <p className={`text-xs text-center mb-6 ${
                    isHighlighted ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center">
                      {plan.price === 0 ? (
                        <span className="text-4xl font-bold">Free</span>
                      ) : (
                        <>
                          <span className="text-sm mr-1">Rp</span>
                          <span className="text-4xl font-bold">
                            {Math.round(plan.price / 1000)}k
                          </span>
                        </>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      isHighlighted ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {plan.duration === 365 && plan.price > 0
                        ? `${formatCurrency(Math.round(plan.price / 12))}/month billed yearly`
                        : plan.duration === 90 && plan.price > 0
                        ? `${formatCurrency(Math.round(plan.price / 3))}/month billed quarterly`
                        : plan.price === 0
                        ? '3 months trial'
                        : `per ${plan.duration === 30 ? 'month' : 'year'}`
                      }
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 min-h-[180px]">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className={`mr-3 mt-0.5 ${
                          isHighlighted ? 'text-gray-300' : 'text-gray-600'
                        }`}>•</span>
                        <span className={isHighlighted ? 'text-gray-200' : 'text-gray-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading || isCurrent}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      isHighlighted
                        ? 'bg-white text-gray-900 hover:bg-gray-100'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } ${
                      loading || isCurrent ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isCurrent ? (
                      '✓ Current Plan'
                    ) : loading ? (
                      'Processing...'
                    ) : plan.price === 0 ? (
                      'Start Free Trial'
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </button>
                </div>
              </div>
            )
          })}
            </div>
            
            {/* Skip Registration Button - Show for users who haven't verified their email */}
            {(!userSubscription?.isVerified || !userSubscription?.emailVerified) && (
              <div className="text-center mt-8">
                <button
                  onClick={handleSkipRegistration}
                  className="px-8 py-3 border-2 border-gray-400 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Skip Registration
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Continue without subscribing and verify your email
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <StandardFooter />
    </div>
  )
}
