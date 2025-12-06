'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import StandardHeader from '@/components/layout/StandardHeader'
import StandardFooter from '@/components/layout/StandardFooter'

function FailedPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const error = searchParams.get('error') || 'Payment was not completed'

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Standard Header */}
      <StandardHeader currentPage="Subscription" />

      {/* Main Content with padding for fixed header */}
      <main className="flex-1 overflow-y-auto pt-24 pb-20">
        <div className="min-h-full flex items-center justify-center px-4 py-8 sm:py-12 lg:py-16" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="w-full max-w-md mx-auto">
            {/* Failed Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
              
              {/* Error Icon & Message */}
              <div className="text-center space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-100">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    Payment Failed
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 font-medium">
                    {error}
                  </p>
                </div>
              </div>

              {/* Error Details */}
              <div className="space-y-4 sm:space-y-5">
                <div className="h-px bg-gray-100"></div>
                
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-gray-900 text-center">Common Issues</h2>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Insufficient funds or card declined</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Network connection timeout</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                      <span>Incorrect payment information</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-px bg-gray-100"></div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/subscription')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 sm:py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Try Again</span>
                  </span>
                </button>
                
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 sm:py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Back to Dashboard
                </button>
              </div>
              
              {/* Support Contact */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Need help?{' '}
                  <a href="mailto:support@pusaka.id" className="text-blue-600 hover:text-blue-800 font-medium">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <StandardFooter />
    </div>
  )
}

export default function PaymentFailedPage() {
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
      <FailedPageContent />
    </Suspense>
  )
}
