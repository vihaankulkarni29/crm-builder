import dotenv from 'dotenv';

// Point strictly to the staging environment file
dotenv.config({ path: '.env.staging' });

const STAGING_URL = 'https://crm-builder-staging.vercel.app/api/v1/agents';
const SECRET = process.env.PRIVATE_API_SECRET;

async function sendRequest(name: string, payload: any, token: string | null) {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const startTime = Date.now();
    const response = await fetch(STAGING_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'ADD_LEAD', payload })
    });
    const endTime = Date.now();

    return { name, status: response.status, timeMs: endTime - startTime };
}

async function runStressTest() {
    console.log("🚀 INITIATING STAGING STRESS TEST...\n");

    // ==========================================
    // TEST 1: The Concurrency Blast (Load Testing)
    // ==========================================
    console.log("💥 TEST 1: Concurrency Blast (Sending 20 leads at the exact same millisecond)");
    const concurrentRequests = [];
    for (let i = 1; i <= 20; i++) {
        const payload = {
            company: `Load Test Corp ${i}`,
            contact_person: `Test Agent ${i}`,
            email: `agent${i}@loadtest.com`,
            value: 50000,
            source: "Stress Test Script",
            assigned_to: "Unassigned"
        };
        concurrentRequests.push(sendRequest(`Req_${i}`, payload, SECRET || ''));
    }

    const results = await Promise.all(concurrentRequests);
    const successCount = results.filter(r => r.status === 200).length;
    console.log(`✅ Result: ${successCount}/20 requests succeeded.`);
    console.log(`⏱️ Average Response Time: ${Math.round(results.reduce((acc, curr) => acc + curr.timeMs, 0) / 20)}ms\n`);

    // ==========================================
    // TEST 2: The Malicious Payload Test (SQL/Logic Protection)
    // ==========================================
    console.log("🛡️ TEST 2: Malicious Payloads (Attempting to break the database)");

    const maliciousTests = [
        {
            name: "Negative Revenue Value",
            payload: { company: "Bad Math Inc", value: -999999 }
        },
        {
            name: "Missing Required Fields",
            payload: { value: 1000 } // Missing 'company'
        },
        {
            name: "Wrong Data Type (String in Number field)",
            payload: { company: "Type Breaker", value: "One Million Dollars" }
        }
    ];

    for (const test of maliciousTests) {
        const res = await sendRequest(test.name, test.payload, SECRET || '');
        if (res.status === 400) {
            console.log(`✅ Blocked: ${test.name} (Status 400 - Zod Shield Active)`);
        } else {
            console.log(`❌ FAILED: API accepted bad data for ${test.name} (Status ${res.status})`);
        }
    }
    console.log("");

    // ==========================================
    // TEST 3: The Auth Bypass Test
    // ==========================================
    console.log("🔒 TEST 3: Authentication Bypass");
    const noAuth = await sendRequest("No Token", { company: "Hacker Inc" }, null);
    console.log(noAuth.status === 403 ? `✅ Blocked: No Token (Status 403)` : `❌ FAILED: Allowed No Token`);

    const badAuth = await sendRequest("Wrong Token", { company: "Hacker Inc" }, "Bearer fake_secret_123");
    console.log(badAuth.status === 403 ? `✅ Blocked: Wrong Token (Status 403)` : `❌ FAILED: Allowed Wrong Token`);

    console.log("\n🏁 STRESS TEST COMPLETE.");
}

runStressTest();
