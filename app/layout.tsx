import React from "react"
import type { Metadata } from 'next'
import { Poppins, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import './globals.css'
import Navigation from '@/components/Navigation'

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins'
})
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mod Project Manager',
  description: 'Track and manage your ETS2/ATS mod projects',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={poppins.variable}>
      <body className="font-poppins antialiased bg-background">
        <div className="flex h-screen">
            <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <Navigation />
          {children}
          </ThemeProvider>
        </div>
      </body>
    </html>
  )
}
