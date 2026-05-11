import type { Metadata, Viewport } from "next"
import { Inter, Bricolage_Grotesque } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Dinkedin — Pickleball tournaments, rankings & rewards",
  description:
    "Find tournaments, climb the rankings, and earn rewards. A community-first pickleball platform built for players.",
}

export const viewport: Viewport = {
  themeColor: "#0F3D2E",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-ink">{children}</body>
    </html>
  )
}
