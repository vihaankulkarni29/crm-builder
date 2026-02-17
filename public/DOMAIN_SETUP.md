# Domain Setup Guide: rfrncs.in

**Goal:** Connect your Vercel project to `rfrncs.in`.

## Steps

1.  **Log in to Vercel**
    *   Go to your project settings.
    *   Select **Domains** from the sidebar.

2.  **Add Domain**
    *   Enter `rfrncs.in` in the input field.
    *   Click **Add**.

3.  **Configure DNS (at your Registrar - GoDaddy, Namecheap, etc.)**
    *   **Type:** `A`
    *   **Name:** `@` (or leave blank)
    *   **Value:** `76.76.21.21`
    *   **TTL:** `Custom` -> `600` (or default)

    *   **Type:** `CNAME`
    *   **Name:** `www`
    *   **Value:** `cname.vercel-dns.com`
    *   **TTL:** `Custom` -> `600` (or default)

4.  **Verify**
    *   Wait for Vercel to show a green checkmark next to the domain.
    *   This may take 15 minutes to 24 hours (usually fast).

## Troubleshooting
*   If invalid configuration: Check for existing A records and remove them.
*   If SSL error: Give it time, Vercel automatically creates the certificate.
