
const anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsc2Vsdm5wZW5sdHNpbW5vcHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTgwMTQsImV4cCI6MjA4NjU3NDAxNH0.zsjB7_w4kv13z3CzOocbiG7jumTFVtDjJVmRko1diZU"
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsc2Vsdm5wZW5sdHNpbW5vcHJ6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk5ODAxNCwiZXhwIjoyMDg2NTc0MDE0fQ.2DF9vO-VomFmDtglw_NvelI9OlH0xWPiBr04Re5Zttc"

function decode(token: string, name: string) {
    console.log(`\n--- Decoding ${name} ---`)
    try {
        const parts = token.split('.')
        if (parts.length !== 3) throw new Error("Invalid JWT format")

        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())

        console.log("Header:", header)
        console.log("Payload:", payload)

        return payload
    } catch (e: any) {
        console.error("Error decoding:", e.message)
        return null
    }
}

const p1 = decode(anonKey, "Anon Key")
const p2 = decode(serviceKey, "Service Key")

if (p1 && p2) {
    if (p1.ref !== p2.ref) {
        console.error("\n❌ MISMATCH DETECTED!")
        console.error(`Anon Key Project: ${p1.ref}`)
        console.error(`Service Key Project: ${p2.ref}`)
        console.error("The keys belong to DIFFERENT Supabase projects.")
    } else {
        console.log("\n✅ Project Reference Match:", p1.ref)
        console.log("The keys belong to the SAME project.")
        console.log("If the Service Key still fails, it has been revoked or the signature is invalid.")
    }

    // Check Expiry
    const now = Math.floor(Date.now() / 1000)
    console.log(`\nCurrent Time: ${now}`)
    console.log(`Anon Exp: ${p1.exp} (Valid for ${(p1.exp - now) / 86400} days)`)
    console.log(`Service Exp: ${p2.exp} (Valid for ${(p2.exp - now) / 86400} days)`)
}
