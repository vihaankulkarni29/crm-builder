import { Groq } from 'groq-sdk';
import 'dotenv/config';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local specifically since we are running a script outside Next.js context sometimes
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Load Keys
const apiKey = process.env.GROQ_API_KEY;
const CRM_SECRET = process.env.PRIVATE_API_SECRET;
const CRM_URL = 'http://localhost:3000/api/v1/agents'; // Use your local dev URL

if (!apiKey) {
    console.error("❌ Error: GROQ_API_KEY is missing in .env.local");
    process.exit(1);
}

if (!CRM_SECRET) {
    console.error("❌ Error: PRIVATE_API_SECRET is missing in .env.local");
    process.exit(1);
}

const groq = new Groq({ apiKey });

// The "Messy" Input (Imagine this came from a Gmail Webhook)
const messyEmail = `
    Hey Vihaan, 
    I just got off a call with Bruce Wayne from Wayne Enterprises. 
    He's the CEO and is interested in our enterprise tier. 
    The deal size looks to be around 500000. 
    His email is bruce@wayne.com and his number is 999-888-7777.
    Can we track this?
`;

async function runAgent() {
    console.log("🤖 Agent: Reading email...");

    try {
        // 1. Ask Groq to extract data into JSON
        console.log("🧠 Thinking (Llama3)...");
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a CRM data extraction bot. Extract the lead details from the text and output ONLY valid JSON matching this structure:
                    {
                        "company": "string",
                        "contact_person": "string",
                        "designation": "string",
                        "email": "string",
                        "phone": "string",
                        "value": number (extract numbers only),
                        "source": "string (set to 'Groq Agent')"
                    }`
                },
                {
                    role: "user",
                    content: messyEmail
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const content = chatCompletion.choices[0]?.message?.content || "{}";
        const extractedData = JSON.parse(content);
        console.log("✅ Groq Extracted:", extractedData);

        // 2. Send to our CRM Fortress
        console.log("🔒 Agent: Knocking on CRM API...");
        const response = await fetch(CRM_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CRM_SECRET}`
            },
            body: JSON.stringify({
                action: 'ADD_LEAD',
                payload: extractedData
            })
        });

        const result = await response.json();

        if (response.ok) {
            console.log("🟢 CRM Accepted:", result.message);
        } else {
            console.error("🔴 CRM Rejected:", result);
        }

    } catch (error) {
        console.error("Agent Crashed:", error);
    }
}

runAgent();
