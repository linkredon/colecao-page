import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import '../styles/card-collection.css'
import '../styles/deck-viewer-compact.css'
import '../styles/compact-layout.css'
import '../styles/quantum-compact-theme.css'
import '../styles/add-card-enhancements.css'
import '../styles/card-search-enhanced.css'
import { AppProvider } from '@/contexts/AppContext'
import CardModalWrapper from '@/components/CardModalWrapper'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

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
      <body className={`${inter.className} ${orbitron.variable} quantum-compact compact-app`}>
        <AppProvider>
          <CardModalWrapper>
            {children}
          </CardModalWrapper>
        </AppProvider>
      </body>
    </html>
  )
}
