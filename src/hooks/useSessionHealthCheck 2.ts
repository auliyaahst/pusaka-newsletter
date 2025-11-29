import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function useSessionHealthCheck() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Only run health check if authenticated
    if (status !== 'authenticated' || !session?.user?.email) return

    const checkSessionHealth = async () => {
      try {
        // Check if user still exists in database
        const response = await fetch('/api/debug/clear-sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'check_user',
            email: session.user.email
          }),
        })

        if (!response.ok) {
          console.warn('Session health check failed')
          return
        }

        const data = await response.json()
        
        if (!data.success) {
          console.warn('User not found in database, clearing session')
          // Clear session if user doesn't exist
          await signOut({ redirect: false })
          router.push('/login')
        }
      } catch (error) {
        console.warn('Session health check error:', error)
      }
    }

    // Run health check on mount and periodically
    checkSessionHealth()
    
    // Check session health every 5 minutes
    const interval = setInterval(checkSessionHealth, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [session?.user?.email, status, router])
}
