import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ShopProviderClient from "@/components/ShopProviderClient"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RecoverMonkey - Shopify Cart Recovery",
  description: "Modern abandoned cart recovery dashboard for Shopify stores",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Make shopId dynamic based on auth/session/shop context
  const shopId = "dae9b65f-1a54-4820-97e4-d662fce6c3e8"
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ShopProviderClient shopId={shopId}>
          <main className={inter.className}>{children}</main>
          </ShopProviderClient>
        </ThemeProvider>
      </body>
    </html>
  )
}
