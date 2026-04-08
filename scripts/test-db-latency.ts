
import { neon } from '@neondatabase/serverless'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is missing!")
    process.exit(1)
}

const db = neon(process.env.DATABASE_URL!)

async function testLatency() {
    console.log("🚀 Initializing Neon Latency Diagnostic...")
    console.log("📍 Target Cluster: " + process.env.DATABASE_URL.split('@')[1].split('/')[0])
    
    try {
        const start = Date.now()
        
        console.log("\n📡 Sending heartbeat query (Wake-up)...")
        // Step 1: First query (Wake-up / Cold start)
        const res1 = await db`SELECT 1 as heartbeat`
        const duration1 = Date.now() - start
        console.log(`⏱️ Heartbeat 1 (Cold Start): ${duration1}ms`)

        // Step 2: Second query (Warm path)
        const start2 = Date.now()
        const res2 = await db`SELECT 1 as heartbeat`
        const duration2 = Date.now() - start2
        console.log(`⏱️ Heartbeat 2 (Warm): ${duration2}ms`)

        // Step 3: Complex Join Simulation
        console.log("\n🔄 Testing CRM Join performance...")
        const start3 = Date.now()
        const activity = await db`
            SELECT al.*, u.name 
            FROM activity_log al 
            LEFT JOIN users u ON al.user_id::uuid = u.id::uuid 
            LIMIT 5
        `
        const duration3 = Date.now() - start3
        console.log(`⏱️ Activity Join (15 records): ${duration3}ms`)

        console.log("\n🏁 Diagnostic Results:")
        if (duration1 > 10000) {
            console.log("⚠️ CRITICAL: Neon is taking >10s to wake up. This is the primary bottleneck.")
        } else if (duration1 > 5000) {
            console.log("ℹ️ Slow wake-up detected. Sequential queries are extremely dangerous here.")
        } else {
            console.log("✅ Neon cluster health is optimal.")
        }

    } catch (error: any) {
        console.error("❌ Diagnostic Failed:", error.message)
    }
}

testLatency()
