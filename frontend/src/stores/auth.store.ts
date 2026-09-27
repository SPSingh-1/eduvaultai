import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
  avatarUrl?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: string
}

interface AuthState {
  user: User | null
  organization: Organization | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, organization: Organization, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, organization, token) =>
        set({ user, organization, token, isAuthenticated: true }),
      logout: () => set({ user: null, organization: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'eduvault-auth',
    }
  )
)
