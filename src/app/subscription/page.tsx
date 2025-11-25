'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'

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
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header with exact blue color from image - Fixed at top */}
      <header 
        className="flex-shrink-0 text-white shadow-md" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* Logo from logo_title.svg */}
              <div className="h-12 flex items-center">
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
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v3H8V5z" />
                        </svg>
                        <span>Dashboard</span>
                      </button>

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

                      {/* Pricing Item */}
                      <button
                        onClick={() => {
                          router.push('/pricing')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-gray-50 px-4 py-3 text-sm transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Subscription</span>
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        {/* Logout */}
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
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

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {/* Subscription Page Title */}
        <div className="text-white py-8 sm:py-12" style={{ backgroundColor: 'var(--accent-blue)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Select the subscription plan that best fits your needs
            </p>
          </div>
        </div>

        {/* Subscription Plans */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="max-w-6xl mx-auto">

        {/* Current Subscription Status */}
        {userSubscription && isSubscriptionActive() && (
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
        )}

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

      {/* Footer - Fixed at bottom, always visible */}
      <footer 
        className="flex-shrink-0 text-white py-4 px-8 shadow-md border-t border-opacity-20 border-gray-300" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
        <p className="text-center text-sm">© The Pusaka Newsletter</p>
      </footer>
    </div>
  )
}
