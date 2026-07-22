import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
})

const supabaseUrl = 'https://zwhdhmrcpqddvoemewim.supabase.co'

const supabaseKey = process.env.SUPABASE_KEY?.trim()

if (!supabaseKey) {
  throw new Error('SUPABASE_KEY no está definida en el .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  global: {
    headers: {
      Authorization: `Bearer ${supabaseKey}`
    }
  }
})
