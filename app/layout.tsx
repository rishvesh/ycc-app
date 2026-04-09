
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Navbar from "@/components/navbar"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Youth Collective Council - Volunteer Connect",
  description: "Connect with organizations and volunteer for causes you care about",
  generator: "v0.app",
  icons: {
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
      },
    ],
    icon: [
      {
        url: "/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
  },
  manifest: "/site.webmanifest",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                }
              } catch (e) {}
            `,
          }}
        />
        <Navbar />
        <div className="mt-6">
            {children}
        </div>
        <Analytics />
      </body>
    </html>
  )
}