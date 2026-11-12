import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://opsnwyxcywxbomsmgljd.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nYl7INfStQ-Yhh7zTWHXrw_PRpYFOYD'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
