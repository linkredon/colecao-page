"use client"

import '../styles/contrast-improvements.css'
import '../styles/critical-contrast-fixes.css'
import { useState, useEffect } from 'react'
import Colecao from './colecao'
import Painel from '@/components/Painel'
import ConstrutorDecks from '@/components/ConstrutorDecks'
import Regras from '@/components/Regras'
import UserHeader from '@/components/UserHeader'
import { useAppContext } from '@/contexts/AppContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Grid3X3, Library, Hammer, BookOpen } from "lucide-react"

// Tipos básicos para a aplicação
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  joinedAt: string
  collectionsCount: number
  totalCards: number
  achievements: string[]
}

interface MTGCard {
  id: string
  name: string
  set_name: string
  set_code: string
  collector_number: string
  rarity: string
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  power?: string
  toughness?: string
  artist: string
  lang: string
  released_at: string
  color_identity: string[]
  foil: boolean
  nonfoil: boolean
  prints_search_uri: string
  image_uris?: {
    normal: string
    small?: string
    art_crop?: string
  }
}

interface CollectionCard {
  card: MTGCard
  quantity: number
  condition: string
  foil: boolean
}

interface UserCollection {
  id: string
  name: string
  description: string
  cards: CollectionCard[]
  createdAt: string
  updatedAt: string
  isPublic: boolean
}

export default function Home() {
  // Estado do usuário
  const [user, setUser] = useState<User | null>(null)

  // Estado para cartas disponíveis (pesquisa)
  const [allCards, setAllCards] = useState<MTGCard[]>([])

  // Usar o contexto global para coleção
  const { currentCollection, setCurrentCollection, adicionarCarta, removerCarta } = useAppContext()

  // Funções de autenticação
  const handleLogin = (userData: User) => {
    setUser(userData)
    // Opcional: salvar no localStorage
    localStorage.setItem('mtg-user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    // Opcional: remover do localStorage
    localStorage.removeItem('mtg-user')
  }

  // Carregar usuário do localStorage ao inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('mtg-user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Garantir que todas as propriedades necessárias existem
        const completeUser: User = {
          id: parsedUser.id || '1',
          name: parsedUser.name || 'Usuário',
          email: parsedUser.email || '',
          avatar: parsedUser.avatar,
          joinedAt: parsedUser.joinedAt || new Date().toISOString(),
          collectionsCount: parsedUser.collectionsCount || 0,
          totalCards: parsedUser.totalCards || 0,
          achievements: parsedUser.achievements || []
        }
        setUser(completeUser)
      } catch (error) {
        console.error('Erro ao carregar usuário salvo:', error)
        // Limpar localStorage se houver erro
        localStorage.removeItem('mtg-user')
      }
    }
  }, [])

  // Função para exportar coleção para CSV
  const exportCollectionToCSV = (collection: UserCollection) => {
    const csvContent = [
      ['Nome', 'Conjunto', 'Raridade', 'Quantidade', 'CMC', 'Tipo'],
      ...collection.cards.map(c => [
        c.card.name,
        c.card.set_name,
        c.card.rarity,
        c.quantity.toString(),
        c.card.cmc.toString(),
        c.card.type_line
      ])
    ].map(row => row.join(',')).join('\\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${collection.name}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-mtg-gradient">
      <div className="container mx-auto p-4">
        {/* Header com botão de login */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">MTG Helper</h1>
            <p className="text-gray-400">Seu companheiro completo para Magic: The Gathering</p>
          </div>
          <UserHeader 
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        </div>

        {/* Navegação Principal */}
        <div className="mb-6">
          <Tabs defaultValue="painel" className="w-full">
            <TabsList className="nav-tabs-enhanced w-full grid grid-cols-5">
              <TabsTrigger value="painel" className="nav-tab-enhanced flex items-center gap-sm">
                <Grid3X3 className="w-4 h-4" />
                Painel
              </TabsTrigger>
              <TabsTrigger value="colecao" className="nav-tab-enhanced flex items-center gap-sm">
                <Library className="w-4 h-4" />
                Coleção
              </TabsTrigger>
              <TabsTrigger value="decks" className="nav-tab-enhanced flex items-center gap-sm">
                <Hammer className="w-4 h-4" />
                Construtor de Decks
              </TabsTrigger>
              <TabsTrigger value="regras" className="nav-tab-enhanced flex items-center gap-sm">
                <BookOpen className="w-4 h-4" />
                Regras
              </TabsTrigger>
              <TabsTrigger value="extras" className="nav-tab-enhanced flex items-center gap-sm">
                <BookOpen className="w-4 h-4" />
                Extras
              </TabsTrigger>
            </TabsList>

            <TabsContent value="painel" className="mt-6 animate-fade-in">
              <Painel />
            </TabsContent>

            <TabsContent value="colecao" className="mt-6 animate-fade-in">
              <Colecao
                allCards={allCards}
                setAllCards={setAllCards}
                exportCollectionToCSV={exportCollectionToCSV}
              />
            </TabsContent>

            <TabsContent value="decks" className="mt-6 animate-fade-in">
              <ConstrutorDecks />
            </TabsContent>

            <TabsContent value="regras" className="mt-6 animate-fade-in">
              <Regras />
            </TabsContent>

            <TabsContent value="extras" className="mt-6 animate-fade-in">
              <div className="text-white text-center py-8">
                <h2 className="text-2xl font-bold mb-4">Extras</h2>
                <p className="text-gray-400">Funcionalidades adicionais em breve...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
