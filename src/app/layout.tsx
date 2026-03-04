import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "RFRNCS OS",
    description: "CRM for Creative Agency",
};

import { Toaster } from "sonner";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark">
            <body className={cn(inter.className, "flex h-screen overflow-hidden bg-background font-sans antialiased text-foreground")}>
                <div className="hidden md:flex">
                    <Sidebar />
                </div>
                <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8 pb-20 md:pb-8">
                    {children}
                </main>
                <MobileNav />
                <Toaster theme="dark" position="top-right" />
            </body>
        </html>
    );
}
