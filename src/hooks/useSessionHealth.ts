import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UseSessionHealthOptions {
  /** Whether to automatically redirect to login on invalid session */
  autoRedirect?: boolean
  /** Whether to show console logs for debugging */
  debug?: boolean
}

/**
 * Hook to monitor session health and handle cleanup
 * Helps prevent session corruption issues
 */
export function useSessionHealth(options: UseSessionHealthOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { autoRedirect = true, debug = false } = options

  useEffect(() => {
    if (status === 'loading') return

    // Check for invalid session scenarios
    if (status === 'authenticated' && session) {
      const { user } = session

      // Validate required user properties
      if (!user?.id || !user?.email) {
        if (debug) {
          console.warn('🚫 Invalid session detected: Missing user data', { user })
        }
        
        // Clear the invalid session
        signOut({ 
          callbackUrl: autoRedirect ? '/login' : undefined,
          redirect: autoRedirect 
        })
        return
      }

      // Check for session corruption indicators
      if (user.isActive === false) {
        if (debug) {
          console.warn('🚫 Invalid session detected: User inactive', { user })
        }
        
        signOut({ 
          callbackUrl: autoRedirect ? '/login' : undefined,
          redirect: autoRedirect 
        })
        return
      }

      if (debug) {
        console.log('✅ Session health check passed', {
          userId: user.id,
          userEmail: user.email,
          userRole: user.role,
          isActive: user.isActive
        })
      }
    }

    // Handle unexpected authenticated state without session data
    if (status === 'authenticated' && !session) {
      if (debug) {
        console.warn('🚫 Invalid state: authenticated but no session data')
      }
      
      // Force a complete session refresh
      window.location.reload()
    }
  }, [session, status, autoRedirect, debug, router])

  return {
    isHealthy: status === 'authenticated' && session?.user?.id && session?.user?.email,
    isLoading: status === 'loading',
    session,
    status
  }
}
