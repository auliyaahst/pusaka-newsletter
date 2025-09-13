'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
<<<<<<< Updated upstream
import { useEffect } from 'react'
=======
import { useEffect, useState } from 'react'
import SubscriptionStatus from '@/components/subscription-status'
>>>>>>> Stashed changes

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11h4v-6h6v6h4V7l-7-5z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">The Pusaka Newsletter</h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-600">{session.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

<<<<<<< Updated upstream
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Dashboard!</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* User Info Card */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">User Information</h3>
                <p className="text-sm text-blue-700">Name: {session.user?.name}</p>
                <p className="text-sm text-blue-700">Email: {session.user?.email}</p>
                <p className="text-sm text-blue-700">Role: {session.user?.role || 'Customer'}</p>
              </div>

              {/* Subscription Card */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Subscription</h3>
                <p className="text-sm text-green-700">Status: Active (Free Trial)</p>
                <p className="text-sm text-green-700">Plan: 3 Months Free</p>
                <p className="text-sm text-green-700">Access: Full Content</p>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left text-sm text-purple-700 hover:text-purple-900">
                    Browse Latest Edition
                  </button>
                  <button className="w-full text-left text-sm text-purple-700 hover:text-purple-900">
                    Search Articles
                  </button>
                  <button className="w-full text-left text-sm text-purple-700 hover:text-purple-900">
                    Manage Subscription
                  </button>
                </div>
              </div>
              
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Edition Preview</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-600 mb-4">
                  Welcome to The Pusaka Newsletter! This is where the latest edition content would appear.
                  Users can browse articles, navigate between editions, and search for specific content.
                </p>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                    Read Latest Edition
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm">
                    Browse Archive
                  </button>
                </div>
              </div>
=======
      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto">
        {/* Subscription Status */}
        <div className="px-8 py-6">
          <SubscriptionStatus />
        </div>

        {/* Edition Header */}
        <div className="px-8 py-4" style={{backgroundColor: 'var(--accent-cream)'}}>
          <div className="flex justify-between items-center">
            <p className="text-gray-800 text-sm font-medium">First Edition, Jul 25</p>
            <div className="relative">
              <input
                type="text"
                placeholder="Article Keywords.."
                className="px-4 py-2 border border-gray-400 rounded text-sm w-52 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
              />
              <button className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
>>>>>>> Stashed changes
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}