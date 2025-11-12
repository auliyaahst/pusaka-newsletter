import { signOut } from 'next-auth/react'

export const handleLogout = () => {
  const baseUrl = globalThis.window ? globalThis.window.location.origin : ''
  return signOut({ callbackUrl: `${baseUrl}/login` })
}
