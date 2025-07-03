import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from '@/contexts/AppContext'
import CardModalWrapper from '@/components/CardModalWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MTG Coleção - Gerenciador de Cartas Magic',
  description: 'Gerencie sua coleção de cartas Magic: The Gathering',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AppProvider>
          <CardModalWrapper>
            {children}
          </CardModalWrapper>
        </AppProvider>
      </body>
    </html>
  )
}
