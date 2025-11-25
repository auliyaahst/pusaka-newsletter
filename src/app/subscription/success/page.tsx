'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

function SuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<{
    subscriptionType?: string
    subscriptionEnd?: string
    isActive?: boolean
  } | null>(null)

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/user/subscription')
      if (response.ok) {
        const data = await response.json()
        setSubscriptionData(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyPayment = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/payments/verify-payment?invoiceId=${invoiceId}`)
      const data = await response.json()

      if (data.success) {
        // Fetch updated subscription status
        await fetchSubscriptionStatus()
      } else {
        setError(data.error || 'Payment verification failed')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
      setError('Failed to verify payment')
      setLoading(false)
    }
  }

  useEffect(() => {
    const invoiceId = searchParams.get('invoice_id')

    if (invoiceId) {
      // Verify payment with backend
      verifyPayment(invoiceId)
    } else {
      // Fetch current subscription status
      fetchSubscriptionStatus()
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="text-center text-white space-y-6">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/40 border-t-white/80 rounded-full animate-spin mx-auto absolute inset-0 m-auto animate-reverse-spin"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl font-semibold">Verifying payment</p>
            <p className="text-sm sm:text-base text-white/70">Please wait a moment...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-100">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Error</h1>
              <p className="text-sm sm:text-base text-gray-600">{error}</p>
            </div>
            <button
              onClick={() => router.push('/subscription')}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 sm:py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header - Minimalist responsive design */}
      <header 
        className="flex-shrink-0 text-white shadow-sm backdrop-blur-md bg-opacity-95" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 sm:h-10 flex items-center">
                <Image 
                  src="/logo_title.svg" 
                  alt="The Pusaka Newsletter Logo" 
                  width={120}
                  height={40}
                  className="h-8 sm:h-10 w-auto"
                  style={{
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Minimalist Menu Button */}
              <div className="relative" data-dropdown="profile">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-white hover:text-blue-200 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 group"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Modern Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right animate-in fade-in scale-in-95 duration-200">
                    {/* Profile Section */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-bold text-sm sm:text-base">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{session?.user?.email}</p>
                          {session?.user?.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-1">
                              {session.user.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/dashboard')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-4 sm:px-5 py-3 text-sm transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v3H8V5z" />
                          </svg>
                        </div>
                        <span className="font-medium">Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push('/profile')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-4 sm:px-5 py-3 text-sm transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="font-medium">Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push('/subscription')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-4 sm:px-5 py-3 text-sm transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="font-medium">Subscription</span>
                      </button>

                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={() => {
                            signOut({ callbackUrl: '/' })
                            setIsMenuOpen(false)
                          }}
                          className="w-full flex items-center space-x-3 text-red-600 hover:bg-red-50 px-4 sm:px-5 py-3 text-sm transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span className="font-medium">Sign Out</span>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-4 py-8 sm:py-12 lg:py-16" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="w-full max-w-md mx-auto">
            {/* Success Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
              
              {/* Success Icon & Message */}
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-100">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    Payment Success!
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
                    Your subscription is now active
                  </p>
                </div>
              </div>

              {/* Subscription Details */}
              {subscriptionData && (
                <div className="space-y-4 sm:space-y-5">
                  <div className="h-px bg-gray-100"></div>
                  
                  <div className="space-y-4">
                    {/* Plan Name */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Plan</span>
                      <span className="text-base sm:text-lg font-bold text-blue-600 capitalize">
                        {subscriptionData.subscriptionType?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-600">Active</span>
                      </div>
                    </div>
                    
                    {/* Next Billing */}
                    {subscriptionData.subscriptionEnd && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Next billing</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(subscriptionData.subscriptionEnd).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {/* Access Level */}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Access</span>
                      <span className="text-sm font-medium text-gray-900">Premium Content</span>
                    </div>
                  </div>
                  
                  <div className="h-px bg-gray-100"></div>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v3H8V5z" />
                    </svg>
                    <span>Go to Dashboard</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Minimalist design */}
      <footer 
        className="flex-shrink-0 text-white py-3 sm:py-4 px-4 sm:px-6 backdrop-blur-md bg-opacity-95 border-t border-white/10" 
        style={{
          backgroundColor: 'var(--accent-blue)'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs sm:text-sm text-white/80 font-medium">
            © {new Date().getFullYear()} The Pusaka Newsletter
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="text-center text-white space-y-6">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white/40 border-t-white/80 rounded-full animate-spin mx-auto absolute inset-0 m-auto"></div>
          </div>
          <div className="space-y-2">
            <p className="text-lg sm:text-xl font-semibold">Loading</p>
            <p className="text-sm sm:text-base text-white/70">Please wait...</p>
          </div>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  )
}
