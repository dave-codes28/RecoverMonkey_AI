import "./globals.css"
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import ShopProviderClient from "@/components/ui/ShopProviderClient"

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`bg-background text-foreground ${inter.className}`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ShopProviderClient shopId={""}>
              <main>{children}</main>
            </ShopProviderClient>
          </ThemeProvider>
      </body>
    </html>
  )
}
