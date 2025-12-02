'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default function VerifyEmailSentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--accent-blue)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-blue)' }}>
      {/* Header */}
      <div className="w-full py-6 px-8 flex justify-center items-center">
        <Image
          src="/logo_title.svg"
          alt="The Pusaka Newsletter"
          width={150}
          height={96}
          className="h-14 sm:h-16 md:h-18 lg:h-24 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div style={{ 
              backgroundColor: 'var(--primary-light)',
              boxShadow: 'var(--shadow-card)'
            }} className="rounded-xl p-8 text-center">
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
            
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a verification email to{' '}
              <strong className="text-gray-900">{session?.user?.email}</strong>.
            </p>

            <p className="text-gray-600 mb-6">
              Please click the link in the email to verify your account and activate your subscription.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>📧 Check your spam folder</strong> if you don&apos;t see the email in your inbox.
              </p>
            </div>

            <div className="space-y-3">
              <Link 
                href="/dashboard"
                className="block w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </Link>

              <Link 
                href="/subscription"
                className="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Subscription
              </Link>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              You can verify your email later. The link will be valid for 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-blue-200 text-sm">© The Pusaka Newsletter</p>
      </div>
    </div>
  )
}
