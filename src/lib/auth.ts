import { createSupabaseClient } from './supabase'
import { UserMetadata } from './supabase'

export const useAuth = () => {
  const supabase = createSupabaseClient()

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          tier: 'free',
          remainingTokens: 3,
          showTokenUsage: false,
          lineWrapping: false,
          theme: 'dark',
          notifications: true,
          dailyTokens: 0,
          extraTokens: 922000,
          monthlyTokens: 240000,
          totalMonthlyTokens: 1000000,
          nextRefill: 1000000,
        } as UserMetadata
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }

  return {
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}