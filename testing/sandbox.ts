import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Point strictly to the staging environment file
dotenv.config({ path: '.env.staging' });

const db = neon(process.env.DATABASE_URL!);

async function runTest() {
    console.log("🧪 Sandbox initialized. Connected to STAGING database.");

    try {
        const data = await db`SELECT * FROM leads LIMIT 1`;
        console.log("Staging Connection Success. Found:", data);
    } catch (error) {
        console.error("Error:", error);
    }
}

runTest();
