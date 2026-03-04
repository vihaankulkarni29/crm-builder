
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://tlselvnpenltsimnoprz.supabase.co"
// Hardcoding keys to bypass .env issues entirely for this test
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsc2Vsdm5wZW5sdHNpbW5vcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk5ODAxNCwiZXhwIjoyMDg2NTc0MDE0fQ.2DF9vO-VomFmDtglw_NvelI9OlH0xWPiBr04Re5Zttc"

console.log("--- Supabase Direct Key Test ---")

async function testConnection() {
    console.log("Testing Service Role Key...")
    // Clean key just incase
    const cleanKey = serviceKey.trim()

    const serviceClient = createClient(supabaseUrl, cleanKey)
    const { data, error } = await serviceClient.from('leads').select('count', { count: 'exact', head: true })

    if (error) {
        console.error("❌ Service Key Failed:", error.message)
    } else {
        console.log("✅ Service Key Verified!")
        console.log("Count:", data)
    }
}

testConnection()
