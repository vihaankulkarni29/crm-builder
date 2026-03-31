'use server'

import { Resend } from 'resend';

// Securely instantiate Resend using the environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCredentialsEmail(userEmail: string, tempPassword: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'RFRNCS OS <onboarding@resend.dev>', // Update to os@rfrncs.in once your domain is verified on Resend
            to: userEmail,
            subject: 'Welcome to RFRNCS OS - Your Login Credentials',
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #000;">Welcome to the Team!</h2>
                    <p>Your RFRNCS OS account has been successfully provisioned by your Ops Head.</p>
                    <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;"><strong>Login ID:</strong> ${userEmail}</p>
                        <p style="margin: 0;"><strong>Temporary Password:</strong> ${tempPassword}</p>
                    </div>
                    <p>Please log in at <a href="https://rfrncs.in/login" style="color: #0066cc;">rfrncs.in/login</a> and begin your operations.</p>
                </div>
            `
        });

        if (error) {
            console.error("Resend API Error:", error);
            return { error: error.message };
        }

        return { success: true, data };
    } catch (err: any) {
        console.error("Email Dispatch Failed:", err);
        return { error: "Failed to dispatch email." };
    }
}
