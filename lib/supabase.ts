import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Dream {
  id: string
  user_id: string
  title: string
  content: string
  emotions: string[]
  vividness: number
  lucidity: number
  themes: string[]
  date: string
  created_at: string
}

export interface SituationAnalysis {
  id: string
  user_id: string
  title: string
  situation: string
  emotions: string[]
  intensity: number
  location: string
  weather: string
  people_involved: string
  triggers: string
  responses: string
  learnings: string
  date: string
  created_at: string
}

export interface GratitudeEntry {
  id: string
  user_id: string
  gratitudes: string[]
  reflection: string
  actions: string[]
  manifestation: string
  photo_url?: string
  date: string
  created_at: string
}
