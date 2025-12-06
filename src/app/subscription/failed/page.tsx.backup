'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

function FailedPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const error = searchParams.get('error') || 'Payment was not completed'

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Fixed Header - Minimalist responsive design */}
      <header 
        className="fixed top-0 left-0 right-0 z-40 text-white shadow-sm backdrop-blur-md bg-opacity-95" 
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

                      <button
                        onClick={() => {
                          router.push('/blog')
                          setIsMenuOpen(false)
                        }}
                        className="w-full flex items-center space-x-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-4 sm:px-5 py-3 text-sm transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16l7-4 7 4V4H7z" />
                          </svg>
                        </div>
                        <span className="font-medium">Blog</span>
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

      {/* Main Content with padding for fixed header */}
      <main className="flex-1 overflow-y-auto pt-16 pb-20">
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
      <footer 
        className="fixed bottom-0 left-0 right-0 z-30 py-2" 
        style={{
          backgroundColor: 'var(--accent-cream)'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} The Pusaka Newsletter
          </p>
        </div>
      </footer>
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
