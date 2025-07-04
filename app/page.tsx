"use client"

import '../styles/professional-mtg-interface.css'
import '../styles/mobile-navigation.css'
import '../styles/header-enhancements.css'
import '../styles/tabs-enhanced.css'
import '../styles/content-refinements.css'
import '../styles/mobile-fixes.css'
import { useState, useEffect } from 'react'
import Colecao from './colecao-compact'
import Painel from '@/components/Painel-compact'
import ConstrutorDecks from '@/components/ConstrutorDecks-compact'
import Regras from '@/components/Regras-compact'
import UserHeader from '@/components/UserHeader'
import MobileNavigation from '@/components/MobileNavigation'
import { useAppContext } from '@/contexts/AppContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Grid3X3, 
  Library, 
  Hammer, 
  BookOpen, 
  Sparkles,
  User,
  Settings,
  Bell,
  Search,
  TrendingUp,
  Award,
  Zap,
  Target
} from "lucide-react"

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
  const [activeTab, setActiveTab] = useState('painel')

  // Estado para cartas disponíveis (pesquisa)
  const [allCards, setAllCards] = useState<MTGCard[]>([])

  // Usar o contexto global para coleção
  const { currentCollection, setCurrentCollection, adicionarCarta, removerCarta } = useAppContext()

  // Funções de autenticação
  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem('mtg-user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('mtg-user')
  }

  // Carregar usuário do localStorage ao inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('mtg-user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
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

  // Configuração das abas com design profissional
  const tabs = [
    {
      id: 'painel',
      label: 'Dashboard',
      icon: Grid3X3,
      component: <Painel />
    },
    {
      id: 'colecao',
      label: 'Coleção',
      icon: Library,
      component: (
        <Colecao
          allCards={allCards}
          setAllCards={setAllCards}
          exportCollectionToCSV={exportCollectionToCSV}
        />
      )
    },
    {
      id: 'decks',
      label: 'Deck Builder',
      icon: Hammer,
      component: <ConstrutorDecks />
    },
    {
      id: 'regras',
      label: 'Regras',
      icon: BookOpen,
      component: <Regras />
    },
    {
      id: 'extras',
      label: 'Recursos',
      icon: Sparkles,
      component: (
        <div className="p-4">
          {/* Header Compacto */}
          <div className="quantum-card-dense p-4 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Recursos Avançados</h2>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Ferramentas premium para aprimorar sua experiência MTG
            </p>
          </div>

          {/* Features Grid - Compact Version */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="quantum-card-dense p-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Pesquisa Avançada</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Filtros avançados com sintaxe Scryfall
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-blue-900/30 text-blue-400">
                    Em Breve
                  </span>
                </div>
              </div>
            </div>

            <div className="quantum-card-dense p-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Monitoramento de Preços</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Alertas sobre preços e tendências
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-yellow-900/30 text-yellow-400">
                    Beta
                  </span>
                </div>
              </div>
            </div>

            <div className="quantum-card-dense p-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Analytics Profissional</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Insights sobre sua coleção
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-green-900/30 text-green-400">
                    Ativo
                  </span>
                </div>
              </div>
            </div>

            <div className="quantum-card-dense p-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">Comunidade MTG</h3>
                  <p className="text-xs text-gray-400 mb-2">
                    Conecte-se com colecionadores
                  </p>
                  <span className="inline-flex items-center h-5 px-2 rounded-md text-[10px] font-medium bg-blue-900/30 text-blue-400">
                    Novo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Tools - Compact Version */}
          <div className="quantum-card-dense">
            <div className="p-3 border-b border-gray-800">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-400" />
                <h3 className="text-sm font-medium text-white">Ferramentas Premium</h3>
              </div>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-md border border-gray-700/50">
                  <div className="w-7 h-7 rounded-md bg-blue-500/20 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">Importação Massiva</h4>
                    <p className="text-[10px] text-gray-400">Importe via CSV/Excel</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-gray-800/30 rounded-md border border-gray-700/50">
                  <div className="w-7 h-7 rounded-md bg-green-500/20 flex items-center justify-center">
                    <Target className="w-3.5 h-3.5 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-medium text-white">API Avançada</h4>
                    <p className="text-[10px] text-gray-400">Integração com sistemas externos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="mtg-app quantum-compact">
      {/* Desktop Header - Escondido em telas pequenas */}
      <div className="hidden md:block">
        <header className="compact-header">
          <div className="mtg-container">
            <div className="flex items-center justify-between">
              <a href="#" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-700 rounded-md flex items-center justify-center text-white text-xs font-bold">
                  MTG
                </div>
                <div>
                  <h1 className="text-base font-bold text-white m-0">MTG Helper</h1>
                  <p className="text-xs text-gray-400 m-0">Collection Manager</p>
                </div>
              </a>
              
              <div>
                <UserHeader 
                  user={user}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>
      </div>
      
      {/* Mobile Navigation - Visível apenas em telas pequenas */}
      <div className="block md:hidden">
        <MobileNavigation 
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onLogout={handleLogout}
        />
      </div>

      {/* Main Container */}
      <div className="mtg-container mt-4">
        {/* Enhanced Navigation Panel */}
        <nav className="mb-5 responsive-nav">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full navigation-tabs"
          >
            <div className="compact-tabs-container border border-indigo-900/50 rounded-xl p-3 bg-gradient-to-br from-gray-900/95 via-blue-950/10 to-gray-950/95 backdrop-blur-lg shadow-xl">
              <div className="ambient-glow"></div>
              <TabsList className="mobile-tabs-grid flex md:flex-row flex-wrap justify-center gap-2 pb-2 mb-1 bg-transparent border-0 p-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="quantum-tab group relative overflow-hidden"
                    >
                      <span className="tab-glow absolute inset-0 opacity-0 group-hover:opacity-30 group-data-[state=active]:opacity-60 transition-opacity"></span>
                      <span className="tab-shine absolute inset-0"></span>
                      <div className="tab-content flex flex-col md:flex-row items-center justify-center">
                        <div className="icon-container">
                          <Icon className="w-4 h-4 md:mr-2 mb-1 md:mb-0 relative z-10 tab-icon" />
                        </div>
                        <span className="text-xs font-medium tracking-wide relative z-10 tab-label">{tab.label}</span>
                      </div>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <div className="flex justify-center mt-3 relative">
                <div className="tab-indicator-container">
                  <div className="tab-indicator-active"></div>
                </div>
                <div className="tab-indicator-glow"></div>
              </div>
              <div className="tabs-bottom-decoration">
                <div className="tabs-decoration-line"></div>
              </div>
            </div>

            {/* Enhanced Content Areas */}
            {tabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="quantum-content-area p-0 mt-4 transition-all duration-300 ease-in-out"
              >
                <div className="content-wrapper">
                  {tab.component}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </nav>
      </div>
    </div>
  )
}
