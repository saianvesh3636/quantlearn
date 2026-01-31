import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ProgressProvider } from '@/providers/ProgressProvider'
import { Sidebar } from '@/components/Sidebar'
import { getCurriculum } from '@/lib/lessons'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'QuantLearn',
  description: 'Interactive learning platform for quantitative trading education',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const curriculum = getCurriculum()

  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ProgressProvider>
          <div className="flex min-h-screen">
            <Sidebar curriculum={curriculum} />
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </ProgressProvider>
      </body>
    </html>
  )
}
