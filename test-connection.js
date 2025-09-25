// Minimal connection test
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jmjvcvahzmmugonhyiuo.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptanZjdmFoem1tdWdvbmh5aXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MjgxNjQsImV4cCI6MjA3NDQwNDE2NH0.dmmFhiAImi4ZtpOVRiTaeaHUHsQIm9z7kqU8YbOqdVE'

const client = createClient(supabaseUrl, anonKey)

async function testConnection() {
  try {
    console.log('Testing basic connection...')
    
    // Simple ping test
    const { data, error } = await client
      .from('surveys')
      .select('id', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.error('Full error:', error)
    } else {
      console.log('✅ Connection successful!')
      console.log('Surveys table accessible')
    }
    
  } catch (err) {
    console.error('❌ Network error:', err.message)
    console.error('This suggests:')
    console.error('1. Internet connection issue')
    console.error('2. Supabase URL/key incorrect')
    console.error('3. Firewall blocking requests')
  }
}

testConnection()
