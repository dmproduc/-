import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://opsnwyxcywxbomsmgljd.supabase.co'
const supabaseAnonKey = 'sb_publishable_nYl7INfStQ-Yhh7zTWHXrw_PRpYFOYD'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
