import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component client
export const createSupabaseClient = () => createClientComponentClient()

// Server component client
export const createSupabaseServerClient = () => createServerComponentClient({ cookies })

// Database types
export interface UserMetadata {
  tier: 'free' | 'pro' | 'enterprise';
  remainingTokens: number;
  showTokenUsage: boolean;
  lineWrapping: boolean;
  theme: 'dark' | 'light' | 'system';
  notifications: boolean;
  dailyTokens: number;
  extraTokens: number;
  monthlyTokens: number;
  totalMonthlyTokens: number;
  nextRefill: number;
  referralId?: string;
  referralTokensEarned?: number;
  freeReferrals?: number;
  proReferrals?: number;
}

export interface Project {
  id: string;
  user_id: string;
  prompt: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}