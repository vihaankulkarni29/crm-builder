import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "@/lib/db"

function NeonAdapter(): any {
    return {
        async createUser(user: any) {
            const res = await db`INSERT INTO users (name, email, "emailVerified", image, role) 
            VALUES (${user.name || null}, ${user.email}, ${user.emailVerified || null}, ${user.image || null}, 'Member') 
            RETURNING *`
            return res[0]
        },
        async getUser(id: string) {
            const res = await db`SELECT * FROM users WHERE id = ${id}`
            return res.length > 0 ? res[0] : null
        },
        async getUserByEmail(email: string) {
            const res = await db`SELECT * FROM users WHERE email = ${email}`
            return res.length > 0 ? res[0] : null
        },
        async getUserByAccount({ providerAccountId, provider }: any) {
            const res = await db`
                SELECT users.* FROM users
                JOIN accounts ON users.id = accounts."userId"
                WHERE accounts."providerAccountId" = ${providerAccountId} AND accounts.provider = ${provider}
            `
            return res.length > 0 ? res[0] : null
        },
        async updateUser(user: any) {
            // Simplified update assuming standard fields
            const res = await db`
                UPDATE users SET 
                    name = COALESCE(${user.name || null}, name),
                    email = COALESCE(${user.email || null}, email),
                    "emailVerified" = COALESCE(${user.emailVerified || null}, "emailVerified"),
                    image = COALESCE(${user.image || null}, image),
                    role = COALESCE(${user.role || null}, role)
                WHERE id = ${user.id}
                RETURNING *
            `
            return res[0]
        },
        async deleteUser(userId: string) {
            await db`DELETE FROM users WHERE id = ${userId}`
        },
        async linkAccount(account: any) {
            await db`
                INSERT INTO accounts (
                    "userId", type, provider, "providerAccountId", 
                    access_token, refresh_token, expires_at, id_token, scope, session_state, token_type
                ) VALUES (
                    ${account.userId}, ${account.type}, ${account.provider}, ${account.providerAccountId}, 
                    ${account.access_token || null}, ${account.refresh_token || null}, ${account.expires_at || null}, 
                    ${account.id_token || null}, ${account.scope || null}, ${account.session_state || null}, ${account.token_type || null}
                ) RETURNING *
            `
            return account
        },
        async unlinkAccount({ providerAccountId, provider }: any) {
            await db`DELETE FROM accounts WHERE "providerAccountId" = ${providerAccountId} AND provider = ${provider}`
        },
        async createSession(session: any) {
            const res = await db`
                INSERT INTO sessions ("sessionToken", "userId", expires) 
                VALUES (${session.sessionToken}, ${session.userId}, ${session.expires}) 
                RETURNING *
            `
            return res[0]
        },
        async getSessionAndUser(sessionToken: string) {
            const sessionRes = await db`SELECT * FROM sessions WHERE "sessionToken" = ${sessionToken}`
            if (sessionRes.length === 0) return null
            const session = sessionRes[0]

            const userRes = await db`SELECT * FROM users WHERE id = ${session.userId}`
            if (userRes.length === 0) return null

            return { session, user: userRes[0] }
        },
        async updateSession(session: any) {
            if (!session.expires) return null
            const res = await db`
                UPDATE sessions SET expires = ${session.expires} 
                WHERE "sessionToken" = ${session.sessionToken} 
                RETURNING *
            `
            return res.length > 0 ? res[0] : null
        },
        async deleteSession(sessionToken: string) {
            await db`DELETE FROM sessions WHERE "sessionToken" = ${sessionToken}`
        },
        async createVerificationToken(verificationToken: any) {
            const res = await db`
                INSERT INTO verification_tokens (identifier, token, expires) 
                VALUES (${verificationToken.identifier}, ${verificationToken.token}, ${verificationToken.expires}) 
                RETURNING *
            `
            return res[0]
        },
        async useVerificationToken({ identifier, token }: any) {
            const res = await db`
                DELETE FROM verification_tokens 
                WHERE identifier = ${identifier} AND token = ${token} 
                RETURNING *
            `
            return res.length > 0 ? res[0] : null
        }
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET || "fallback_secret_for_build",
    trustHost: true,
    adapter: NeonAdapter(),
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null
                
                const userRes = await db`SELECT * FROM users WHERE email = ${credentials.email as string}`
                if (userRes.length === 0) return null
                
                const user = userRes[0]
                // Plain text comparison for "instant" Edge performance
                if (user.password_hash === credentials.password) {
                    return user
                }
                
                return null
            }
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }: any) {
            if (session.user && token) {
                session.user.role = token.role as string
                session.user.id = token.id as string
            }
            return session
        }
    }
})
