'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
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

interface PaymentMethod {
  id: string
  name: string
  icon: string
  type: 'card' | 'ewallet' | 'qris'
  description: string
}

const subscriptionPlans: SubscriptionPlan[] = [
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
    badge: 'BEST VALUE',
    description: 'Most chosen plan by our readers',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Priority support',
      'Download PDF articles',
      'Early access to new content',
      'Mobile app access',
      'Exclusive webinars'
    ]
  },
  {
    id: 'annually',
    name: 'Premium',
    price: 899000, // IDR 899,000 (save 24%)
    currency: 'IDR',
    duration: 365,
    badge: 'PREMIUM',
    description: 'Complete access with maximum savings',
    features: [
      'Access to all articles',
      'Monthly newsletter',
      'Premium support',
      'Download PDF articles',
      'Early access to new content',
      'Exclusive webinars',
      'Direct author contact',
      'Mobile app access',
      'Archive access (5+ years)',
      'Print edition delivery'
    ]
  }
]

const paymentMethods: PaymentMethod[] = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: '💳',
    type: 'card',
    description: 'Visa, Mastercard, JCB'
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: '🟣',
    type: 'ewallet',
    description: 'Pay with OVO Balance'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: '🟢',
    type: 'ewallet',
    description: 'Pay with GoPay Balance'
  },
  {
    id: 'dana',
    name: 'DANA',
    icon: '🔵',
    type: 'ewallet',
    description: 'Pay with DANA Balance'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    icon: '🟠',
    type: 'ewallet',
    description: 'Pay with ShopeePay'
  },
  {
    id: 'qris',
    name: 'QRIS',
    icon: '📱',
    type: 'qris',
    description: 'Scan QR code to pay'
  }
]

interface UserSubscription {
  subscriptionType: string
  subscriptionEnd: string | null
  isActive: boolean
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<'plans' | 'payment' | 'processing'>('plans')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchUserSubscription()
    }
  }, [status, router])

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription')
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
    const monthlyPrice = 99000
    const totalMonthlyPrice = monthlyPrice * (plan.duration / 30)
    const savings = totalMonthlyPrice - plan.price
    const percentage = (savings / totalMonthlyPrice) * 100
    return { amount: savings, percentage }
  }

  const handleSubscribe = async (planId: string) => {
    if (!session?.user?.email) return

    setSelectedPlan(planId)
    setCurrentStep('payment')
  }

  const handlePaymentMethodSelect = async (paymentMethodId: string) => {
    if (!selectedPlan || !session?.user?.email) return

    setSelectedPaymentMethod(paymentMethodId)
    setLoading(true)
    setCurrentStep('processing')

    try {
      const response = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: selectedPlan,
          userEmail: session.user.email,
          paymentMethod: paymentMethodId,
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        // Redirect to Xendit payment page
        window.location.href = data.paymentUrl
      } else {
        toast.error(data.error || 'Failed to create payment')
        setCurrentStep('payment')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error('Failed to create subscription')
      setCurrentStep('payment')
    } finally {
      setLoading(false)
    }
  }

  const goBackToPlans = () => {
    setSelectedPlan(null)
    setSelectedPaymentMethod(null)
    setCurrentStep('plans')
    setLoading(false)
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header */}
      <header className="text-white" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
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
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Unlock Premium Content
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Join thousands of readers who trust The Pusaka Newsletter for insightful analysis, 
            exclusive interviews, and comprehensive reporting on the topics that matter most.
          </p>
        </div>

        {/* Current Subscription Status */}
        {userSubscription && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 mb-8 border border-green-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Current Subscription</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  {userSubscription.subscriptionType.replace('_', ' ')} Plan
                </p>
                <p className="text-gray-600">
                  {isSubscriptionActive() ? (
                    <>
                      <span className="text-green-600 font-medium">Active until</span>{' '}
                      {userSubscription.subscriptionEnd ? 
                        new Date(userSubscription.subscriptionEnd).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'No expiry'}
                    </>
                  ) : (
                    <span className="text-red-600 font-medium">Expired or Inactive</span>
                  )}
                </p>
              </div>
              
              <div className="flex items-center justify-end">
                <div className={`px-6 py-3 rounded-full text-sm font-bold ${
                  isSubscriptionActive() 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {isSubscriptionActive() ? '✓ Active' : '✗ Inactive'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans */}
        {currentStep === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {subscriptionPlans.map((plan) => {
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
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-gray-600 ml-2 text-lg">
                        /{plan.duration === 30 ? 'month' : plan.duration === 90 ? 'quarter' : 'year'}
                      </span>
                    </div>
                    
                    {plan.id !== 'monthly' && savings.amount > 0 && (
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
                    )}
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
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
                        : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-900 hover:to-black shadow-lg hover:shadow-xl'
                    } ${
                      loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'
                    }`}
                  >
                    {isCurrent ? (
                      '✓ Current Plan'
                    ) : (
                      <>Choose {plan.name}</>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        )}

        {/* Payment Selection Section */}
        {currentStep === 'payment' && selectedPlan && (
          <div className="max-w-4xl mx-auto mb-16">
            {/* Back Button */}
            <button
              onClick={goBackToPlans}
              disabled={loading}
              className="mb-6 flex items-center text-white hover:text-blue-200 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Plans
            </button>

            {/* Selected Plan Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Subscription</h2>
                <div className="inline-flex items-center bg-blue-50 rounded-full px-6 py-3">
                  <span className="text-blue-800 font-semibold">
                    {subscriptionPlans.find(p => p.id === selectedPlan)?.name} Plan - {' '}
                    {formatCurrency(subscriptionPlans.find(p => p.id === selectedPlan)?.price || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Payment Method</h3>
              
              {/* Credit Card */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Credit & Debit Cards
                </h4>
                <button
                  onClick={() => handlePaymentMethodSelect('credit_card')}
                  disabled={loading}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl mr-6">
                        💳
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">Credit Card</p>
                        <p className="text-gray-600">Visa, Mastercard, JCB</p>
                        <p className="text-sm text-gray-500 mt-1">Secure and instant payment</p>
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* E-Wallets */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  E-Wallets
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentMethods.filter(method => method.type === 'ewallet').map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      disabled={loading}
                      className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl mr-4 ${
                          method.id === 'ovo' ? 'bg-purple-500' :
                          method.id === 'gopay' ? 'bg-green-500' :
                          method.id === 'dana' ? 'bg-blue-500' :
                          'bg-orange-500'
                        }`}>
                          {method.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-blue-700">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div>
                <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  QR Code Payment
                </h4>
                <button
                  onClick={() => handlePaymentMethodSelect('qris')}
                  disabled={loading}
                  className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center text-white text-3xl mr-6">
                        📱
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">QRIS</p>
                        <p className="text-gray-600">Scan QR code to pay</p>
                        <p className="text-sm text-gray-500 mt-1">Works with all Indonesian banking apps</p>
                      </div>
                    </div>
                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {currentStep === 'processing' && (
          <div className="max-w-2xl mx-auto text-center mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Payment</h3>
              <p className="text-gray-600">
                Please wait while we redirect you to the secure payment page...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
              </p>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        {currentStep === 'plans' && (
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Why Choose The Pusaka Newsletter?
          </h2>
            <p className="text-gray-600 leading-relaxed">
              Join a community of informed readers who value quality journalism, 
              in-depth analysis, and exclusive access to the stories that shape our world.
            </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Premium Content</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Exclusive articles, investigative reports, and in-depth analysis you won&apos;t find anywhere else</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Ad-Free Experience</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Enjoy uninterrupted reading with no ads, pop-ups, or distractions</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Early Access</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Get new articles 24-48 hours before they go public to the general audience</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 3v3m6 6h3m-6 6v3m-6-6H3" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Priority Support</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Direct access to our editorial team and priority customer support</p>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Mobile App Access
              </h4>
              <p className="text-gray-600 text-sm">Read anywhere with our iOS and Android apps</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Offline Reading
              </h4>
              <p className="text-gray-600 text-sm">Download articles for offline reading</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                Newsletter Archive
              </h4>
              <p className="text-gray-600 text-sm">Access to 5+ years of premium content</p>
            </div>
          </div>
        </div>
        )}

        {/* FAQ Section */}
        {currentStep === 'plans' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Everything you need to know about our subscription plans and payment options.
          </p>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">?</span>
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely! You can cancel your subscription at any time from your account settings. 
                You&apos;ll continue to have full access until the end of your current billing period, 
                and we won&apos;t charge you for the next cycle.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">💳</span>
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We accept a wide range of payment methods including credit cards (Visa, Mastercard, JCB), 
                popular e-wallets (OVO, GoPay, DANA, ShopeePay), and QRIS for QR code payments. 
                All payments are processed securely through Xendit.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🎁</span>
                Is there a free trial?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                New subscribers get a 7-day free trial to explore our premium content. 
                You can cancel anytime during the trial period and won&apos;t be charged. 
                After the trial, your chosen subscription will begin automatically.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🔄</span>
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! You can upgrade or downgrade your plan at any time from your account settings. 
                If you upgrade, you&apos;ll be charged the prorated difference immediately. 
                If you downgrade, the change will take effect at the end of your current billing cycle.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">🔒</span>
                Is my payment information secure?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Your payment information is completely secure. We use Xendit, a leading payment processor 
                that is PCI DSS compliant and uses bank-level encryption to protect your data. 
                We never store your payment information on our servers.
              </p>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
