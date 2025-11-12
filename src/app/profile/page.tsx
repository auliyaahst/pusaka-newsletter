'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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
        setMessage({ type: 'success', text: 'Profile updated successfully' })
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
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--accent-cream)' }}>
      {/* Header */}
      <header className="text-white" style={{backgroundColor: 'var(--accent-blue)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.back()}
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
              onClick={() => router.back()}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-3xl">
                  {profile?.name?.charAt(0).toUpperCase() || session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none bg-transparent"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={updateLoading}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updateLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false)
                          setEditedName(profile?.name || '')
                        }}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile?.name || 'Unnamed User'}
                      </h1>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-500 hover:text-gray-700"
                        title="Edit name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{profile?.email}</p>
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(profile?.role || '')}`}>
                    {profile?.role?.replace(/_/g, ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubscriptionStatusColor(profile?.subscriptionType || '', profile?.isActive || false)}`}>
                    {profile?.isActive ? formatSubscriptionType(profile?.subscriptionType || '') : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="px-6 py-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Account Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Status</label>
                <p className={`text-sm font-medium ${profile?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {profile?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <p className="text-sm text-gray-900">{profile?.role?.replace(/_/g, ' ')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Type</label>
                <p className="text-sm text-gray-900">{formatSubscriptionType(profile?.subscriptionType || '')}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                <p className="text-sm text-gray-900">{formatDate(profile?.createdAt || null)}</p>
              </div>
              
              {profile?.subscriptionStart && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Start</label>
                  <p className="text-sm text-gray-900">{formatDate(profile.subscriptionStart)}</p>
                </div>
              )}
              
              {profile?.subscriptionEnd && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subscription End</label>
                  <p className="text-sm text-gray-900">{formatDate(profile.subscriptionEnd)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-6 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* <Link
                href="/subscription"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Manage Subscription
              </Link> */}
              
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Back to Dashboard
              </Link>
              
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p>{message.text}</p>
          </div>
        )}
      </main>
    </div>
  )
}
