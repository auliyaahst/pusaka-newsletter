'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import SubscriptionStatus from '@/components/subscription/subscription-status'
import StandardFooter from '@/components/layout/StandardFooter'
import StandardHeader from '@/components/layout/StandardHeader'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  name: string | null
  email: string
  role: string
  subscriptionType: string
  subscriptionStart: string | null
  subscriptionEnd: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchProfile()
    }
  }, [status, session, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditedName(data.name || '')
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateName = async () => {
    if (!editedName.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' })
      return
    }

    setUpdateLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editedName.trim() }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
        toast.success('Profile updated successfully')
        // setMessage({ type: 'success', text: 'Profile updated successfully' })
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setUpdateLoading(false)
    }
  }

  const getSubscriptionStatusColor = (subscriptionType: string, isActive: boolean) => {
    if (!isActive) return 'bg-red-100 text-red-800'
    switch (subscriptionType) {
      case 'FREE_TRIAL':
        return 'bg-gray-100 text-gray-800'
      case 'MONTHLY':
      case 'QUARTERLY':
      case 'HALF_YEARLY':
      case 'ANNUALLY':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatSubscriptionType = (type: string) => {
    return type.replaceAll('_', ' ').toLowerCase().replaceAll(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800'
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'PUBLISHER':
        return 'bg-blue-100 text-blue-800'
      case 'EDITOR':
        return 'bg-indigo-100 text-indigo-800'
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-cream)' }}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Fixed Header */}
      <StandardHeader currentPage="Profile" />

      {/* Main Content with padding for fixed header */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24 pb-20">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Profile Header */}
          <div className="px-8 py-12 text-center border-b border-gray-100">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-semibold text-2xl">
                {profile?.name?.charAt(0).toUpperCase() || session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            
            <div className="max-w-md mx-auto">
              {isEditing ? (
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="text-2xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none text-center px-4 py-2"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdateName}
                    disabled={updateLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {updateLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditedName(profile?.name || '')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {profile?.name || 'Unnamed User'}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    title="Edit name"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              )}
              
              <p className="text-gray-600 mb-6">{profile?.email}</p>
              
              {/* <div className="flex items-center justify-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getRoleColor(profile?.role || '')}`}>
                  {profile?.role?.replaceAll('_', ' ')}
                </span>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getSubscriptionStatusColor(profile?.subscriptionType || '', profile?.isActive || false)}`}>
                  {profile?.isActive ? formatSubscriptionType(profile?.subscriptionType || '') : 'Inactive'}
                </span>
              </div> */}
            </div>
          </div>

          {/* Account Details */}
          {/* <div className="px-8 py-8 border-b border-gray-100">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Account Information</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Account Status</span>
                  <p className={`text-sm font-semibold ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {profile?.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Role</span>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{profile?.role?.replaceAll('_', ' ')}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Subscription Type</span>
                  <p className="text-sm font-semibold text-gray-900">{formatSubscriptionType(profile?.subscriptionType || '')}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Member Since</span>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(profile?.createdAt || null)}</p>
                </div>
                
                {profile?.subscriptionStart && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="block text-sm font-medium text-gray-500 mb-2">Subscription Start</span>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(profile.subscriptionStart)}</p>
                  </div>
                )}
                
                {profile?.subscriptionEnd && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <span className="block text-sm font-medium text-gray-500 mb-2">Subscription End</span>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(profile.subscriptionEnd)}</p>
                  </div>
                )}
              </div>
            </div>
          </div> */}

          {/* Subscription Status Section */}
          <div className="px-8 py-8 border-b border-gray-100">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">Subscription Status</h2>
              <SubscriptionStatus />
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-8">
            <div className="max-w-lg mx-auto">
              <div className="flex flex-col space-y-4">
              <Link
                href="/subscription"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Manage Subscription
              </Link>
              
              <Link
                href="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Back to Dashboard
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors border border-red-200 hover:border-red-300"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {/* {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p>{message.text}</p>
          </div>
        )} */}
      </main>

      {/* Fixed Footer */}
      <StandardFooter />
    </div>
  )
}
