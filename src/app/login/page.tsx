'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: `${window.location.origin}/dashboard`
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.url) {
        router.push(result.url)
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
    
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Sign in with Google and redirect to dashboard
      await signIn('google', { 
        callbackUrl: `${window.location.origin}/dashboard`,
        redirect: true
      }).catch((err) => {
        console.error('Google Sign In Error:', err);
        setError('An error occurred during Google sign in. Please try again.')
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--primary-dark)' }}>
      {/* Header with Brand */}
<<<<<<< HEAD
      <div className="w-full py-6 px-8 flex justify-center items-center" style={{ backgroundColor: 'var(--primary-dark)' }}>
        <Image
          src="/logo_title.svg"
          alt="The Pusaka Newsletter"
          width={150}
          height={96}
          className="h-14 sm:h-16 md:h-18 lg:h-24 w-auto"
          style={{
            filter: 'brightness(0) invert(1)'
          }}
        />
=======
      <div className="w-full py-6 px-8 flex items-center" style={{ backgroundColor: 'var(--primary-dark)' }}>
        <div className="flex items-center gap-3">
          <img
            src="/eagle-logo.svg"
            alt="The Pusaka Newsletter"
            className="h-8 w-8"
          />
          <span style={{ color: 'var(--text-white)' }} className="font-serif text-xl">The Pusaka Newsletter</span>
        </div>
        <div className="flex-grow text-right">
          <span style={{ color: 'var(--text-muted)' }} className="text-sm">ThePusaka.id</span>
        </div>
>>>>>>> parent of 3693d0e (font, logo == login, register)
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">

          {/* Login Form */}
          <div style={{ 
              backgroundColor: 'var(--primary-light)',
              boxShadow: 'var(--shadow-card)'
            }} className="rounded-xl p-8">
            <h2 style={{ color: 'var(--text-primary)' }} className="text-2xl font-bold mb-6">Login</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email here"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password here"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: 'black',
                  color: 'var(--text-white)',
                  borderColor: 'var(--border-light)'
                }}
                className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>


            <div className="mt-6 text-center">
              <span className="text-sm text-gray-600">Don&apos;t have an account? </span>
              <Link href="/register" className="text-sm text-blue-600 hover:text-blue-800 underline">
                Sign up
              </Link>
            </div>
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