import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://buesnxvzuubjrqjhfreh.supabase.co'

const supabaseAnonKey =
'sb_publishable_4jVlad5MvGn3RuHEmDN_Hg_X3PqxH9p'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)