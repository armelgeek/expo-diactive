import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmnluqlmhbamftdvaxxb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbmx1cWxtaGJhbWZ0ZHZheHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4ODMyMjQsImV4cCI6MjA1MTQ1OTIyNH0.9u26exWroG5SHeM0M6VQLHoy62M7UbzigIIsASOee-Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}) 