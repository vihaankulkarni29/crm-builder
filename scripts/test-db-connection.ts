
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log('Testing Supabase connection...')
    console.log(`URL: ${supabaseUrl}`)

    try {
        // Try to select from a table that likely exists or just get auth settings to test connection
        // We'll try to fetch leads, but if the table doesn't exist it will error, which is also a valid "connection test" result (connected but table missing)
        const { data, error } = await supabase.from('leads').select('count', { count: 'exact', head: true })

        if (error) {
            console.error('❌ Connection Error or Table Missing:', error.message)
            // Check if it's a specific postgrest error
            if (error.code) {
                console.error(`Error Code: ${error.code}`)
            }
        } else {
            console.log('✅ Connection Successful!')
            console.log(`Found ${data} (or null/count) in 'leads' table (head request).`)
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err)
    }
}

testConnection()
