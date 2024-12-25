import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/Navbar'

export const dynamic = 'force-dynamic'

export const metadata = {
  metadataBase: new URL('https://postgres-drizzle.vercel.app'),
  title: 'AI Images - Generate and Share',
  description: 'Generate and share AI-powered images',
}

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
