"use client"

import '../styles/deck-constructor.css'
import { useState, useMemo } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import DeckBuilder from '@/components/DeckBuilder'
import DeckViewerComponent from '@/components/DeckViewerComponent'
import DeckImporter from '@/components/DeckImporter'
import { 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  Save, 
  Search, 
  Filter, 
  BarChart3,
  Shuffle,
  Target,
  Zap,
  Users,
  Calendar,
  Eye,
  Upload,
  Package
} from "lucide-react"

export default function ConstrutorDecks() {
  const { decks, criarDeck, editarDeck, deletarDeck, duplicarDeck } = useAppContext()
  
  // Estados locais para UI
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'viewer' | 'builder'>('list')
  const [isCreatingDeck, setIsCreatingDeck] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
    visible: boolean
  }>({ type: 'info', message: '', visible: false })

  // Estados para criação de deck
  const [newDeckData, setNewDeckData] = useState({
    name: '',
    format: 'Standard',
    colors: [] as string[],
    description: ''
  })

  // Estados para filtros e ordenação
  const [searchFilter, setSearchFilter] = useState('')
  const [formatFilter, setFormatFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'cards' | 'format'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Função para mostrar notificações
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }))
    }, 3000)
  }

  // Função para criar novo deck
  const handleCreateDeck = () => {
    if (!newDeckData.name.trim()) {
      showNotification('error', 'Nome do deck é obrigatório')
      return
    }

    const deckId = criarDeck({
      name: newDeckData.name,
      format: newDeckData.format,
      colors: newDeckData.colors,
      cards: [],
      isPublic: false,
      tags: [],
      description: newDeckData.description
    })
    setNewDeckData({ name: '', format: 'Standard', colors: [], description: '' })
    setIsCreatingDeck(false)
    showNotification('success', 'Deck criado com sucesso!')
    
    // Ir direto para o builder do novo deck
    setSelectedDeck(deckId)
    setViewMode('builder')
  }

  const handleDuplicateDeck = (deckId: string) => {
    const newDeckId = duplicarDeck(deckId)
    showNotification('success', 'Deck duplicado com sucesso!')
  }

  const handleDeleteDeck = (deckId: string) => {
    deletarDeck(deckId)
    if (selectedDeck === deckId) {
      setSelectedDeck(null)
      setViewMode('list')
    }
    showNotification('success', 'Deck removido com sucesso!')
  }

  const toggleColor = (colorSymbol: string) => {
    setNewDeckData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorSymbol)
        ? prev.colors.filter(c => c !== colorSymbol)
        : [...prev.colors, colorSymbol]
    }))
  }

  // Filtrar e ordenar decks
  const filteredAndSortedDecks = useMemo(() => {
    let filtered = decks;

    // Filtro por nome
    if (searchFilter.trim()) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(deck => 
        deck.name.toLowerCase().includes(search) ||
        (deck.description && deck.description.toLowerCase().includes(search))
      );
    }

    // Filtro por formato
    if (formatFilter !== 'all') {
      filtered = filtered.filter(deck => deck.format === formatFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.lastModified || a.createdAt).getTime() - 
                      new Date(b.lastModified || b.createdAt).getTime();
          break;
        case 'cards':
          const aTotal = a.cards.reduce((sum, c) => sum + c.quantity, 0);
          const bTotal = b.cards.reduce((sum, c) => sum + c.quantity, 0);
          comparison = aTotal - bTotal;
          break;
        case 'format':
          comparison = a.format.localeCompare(b.format);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [decks, searchFilter, formatFilter, sortBy, sortOrder]);

  // Se estiver visualizando um deck
  if (viewMode === 'viewer' && selectedDeck) {
    return (
      <DeckViewerComponent 
        deckId={selectedDeck}
        onClose={() => {
          setSelectedDeck(null)
          setViewMode('list')
        }}
        onEdit={() => setViewMode('builder')}
      />
    )
  }

  // Se estiver construindo/editando um deck
  if (viewMode === 'builder') {
    return (
      <DeckBuilder 
        deckId={selectedDeck || undefined}
        onSave={(deckId) => {
          showNotification('success', selectedDeck ? 'Deck atualizado com sucesso!' : 'Deck criado com sucesso!')
          setSelectedDeck(deckId)
          setViewMode('list')
        }}
        onCancel={() => {
          setSelectedDeck(null)
          setViewMode('list')
        }}
      />
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Notificação */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0 notification-enter ${
          notification.type === 'success' ? 'border-green-500/30' :
          notification.type === 'error' ? 'border-red-500/30' : 'border-blue-500/30'
        } text-white border`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Construtor de Decks
        </h1>
        <p className="text-gray-400 text-lg">
          Crie, edite e gerencie seus decks de Magic: The Gathering
        </p>
      </div>

      {/* Ações Rápidas */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Criar Novo Deck</h4>
              <Button
                onClick={() => setIsCreatingDeck(true)}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar do Zero
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Importar Lista de Deck</h4>
              <DeckImporter 
                onImportSuccess={() => showNotification('success', 'Deck importado com sucesso!')}
                onImportError={(error: string) => showNotification('error', `Erro ao importar deck: ${error}`)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação de Deck */}
      {isCreatingDeck && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md modal-content">
            <CardHeader>
              <CardTitle className="text-white">Criar Novo Deck</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome do Deck *
                </label>
                <Input
                  value={newDeckData.name}
                  onChange={(e) => setNewDeckData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Aggro Vermelho"
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Formato
                </label>
                <Select 
                  value={newDeckData.format} 
                  onValueChange={(value) => setNewDeckData(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Standard" className="text-white hover:bg-gray-700">Standard</SelectItem>
                    <SelectItem value="Pioneer" className="text-white hover:bg-gray-700">Pioneer</SelectItem>
                    <SelectItem value="Modern" className="text-white hover:bg-gray-700">Modern</SelectItem>
                    <SelectItem value="Legacy" className="text-white hover:bg-gray-700">Legacy</SelectItem>
                    <SelectItem value="Vintage" className="text-white hover:bg-gray-700">Vintage</SelectItem>
                    <SelectItem value="Commander" className="text-white hover:bg-gray-700">Commander</SelectItem>
                    <SelectItem value="Pauper" className="text-white hover:bg-gray-700">Pauper</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cores
                </label>
                <div className="flex gap-2">
                  {['W', 'U', 'B', 'R', 'G'].map(color => (
                    <Button
                      key={color}
                      variant={newDeckData.colors.includes(color) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleColor(color)}
                      className={`w-10 h-10 p-0 font-bold transition-all duration-200 ${
                        newDeckData.colors.includes(color)
                          ? color === 'W' ? 'bg-yellow-200 text-gray-900 border-yellow-300' :
                            color === 'U' ? 'bg-blue-500 text-white border-blue-400' :
                            color === 'B' ? 'bg-gray-900 text-white border-gray-400' :
                            color === 'R' ? 'bg-red-500 text-white border-red-400' :
                            'bg-green-500 text-white border-green-400'
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <Textarea
                  value={newDeckData.description}
                  onChange={(e) => setNewDeckData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição opcional do deck..."
                  className="bg-gray-900/50 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateDeck}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Deck
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingDeck(false)
                    setNewDeckData({ name: '', format: 'Standard', colors: [], description: '' })
                  }}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Decks */}
      <div className="space-y-4">
        {/* Header com filtros */}
        <Card className="bg-gray-800/50 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">Meus Decks ({filteredAndSortedDecks.length})</h2>
                
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Buscar decks..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="bg-gray-900/50 border-gray-600 text-white placeholder-gray-400"
                  />
                  <Select value={formatFilter} onValueChange={setFormatFilter}>
                    <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                      <SelectValue placeholder="Formato" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">Todos os formatos</SelectItem>
                      <SelectItem value="Standard" className="text-white hover:bg-gray-700">Standard</SelectItem>
                      <SelectItem value="Pioneer" className="text-white hover:bg-gray-700">Pioneer</SelectItem>
                      <SelectItem value="Modern" className="text-white hover:bg-gray-700">Modern</SelectItem>
                      <SelectItem value="Legacy" className="text-white hover:bg-gray-700">Legacy</SelectItem>
                      <SelectItem value="Vintage" className="text-white hover:bg-gray-700">Vintage</SelectItem>
                      <SelectItem value="Commander" className="text-white hover:bg-gray-700">Commander</SelectItem>
                      <SelectItem value="Pauper" className="text-white hover:bg-gray-700">Pauper</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="date" className="text-white hover:bg-gray-700">Data</SelectItem>
                        <SelectItem value="name" className="text-white hover:bg-gray-700">Nome</SelectItem>
                        <SelectItem value="cards" className="text-white hover:bg-gray-700">Nº Cartas</SelectItem>
                        <SelectItem value="format" className="text-white hover:bg-gray-700">Formato</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {decks.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <h3 className="text-xl font-medium text-white mb-2">Nenhum deck criado</h3>
              <p className="text-gray-400 mb-6">
                Crie seu primeiro deck para começar a construir
              </p>
              <Button
                onClick={() => setIsCreatingDeck(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => {
              // Calcular estatísticas do deck
              const mainboardCount = deck.cards.filter(c => c.category === 'mainboard').reduce((sum, c) => sum + c.quantity, 0)
              const sideboardCount = deck.cards.filter(c => c.category === 'sideboard').reduce((sum, c) => sum + c.quantity, 0)
              const commanderCount = deck.cards.filter(c => c.category === 'commander').reduce((sum, c) => sum + c.quantity, 0)
              const totalCards = mainboardCount + sideboardCount + commanderCount
              
              // Calcular CMC médio
              const totalCmc = deck.cards.reduce((sum, c) => sum + (c.card.cmc * c.quantity), 0)
              const avgCmc = totalCards > 0 ? (totalCmc / totalCards).toFixed(1) : '0'
              
              // Obter cartas por tipo para estatísticas rápidas
              const creatures = deck.cards.filter(c => c.card.type_line.toLowerCase().includes('creature')).reduce((sum, c) => sum + c.quantity, 0)
              const instants = deck.cards.filter(c => c.card.type_line.toLowerCase().includes('instant')).reduce((sum, c) => sum + c.quantity, 0)
              const sorceries = deck.cards.filter(c => c.card.type_line.toLowerCase().includes('sorcery')).reduce((sum, c) => sum + c.quantity, 0)
              const lands = deck.cards.filter(c => c.card.type_line.toLowerCase().includes('land')).reduce((sum, c) => sum + c.quantity, 0)
              
              return (
                <Card key={deck.id} className="bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50 transition-all duration-200 hover:shadow-lg group deck-card-hover deck-card-animate">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-lg font-bold truncate group-hover:text-blue-400 transition-colors">
                          {deck.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs border-0 ${
                              deck.format === 'Standard' ? 'bg-blue-900/50 text-blue-300' :
                              deck.format === 'Commander' ? 'bg-yellow-900/50 text-yellow-300' :
                              deck.format === 'Modern' ? 'bg-green-900/50 text-green-300' :
                              deck.format === 'Legacy' ? 'bg-purple-900/50 text-purple-300' :
                              'bg-gray-700/50 text-gray-300'
                            }`}
                          >
                            {deck.format}
                          </Badge>
                          {deck.colors.length > 0 && (
                            <div className="flex gap-1">
                              {deck.colors.map(color => (
                                <div 
                                  key={color}
                                  className={`w-4 h-4 rounded-full border border-gray-600 text-xs flex items-center justify-center font-bold ${
                                    color === 'W' ? 'bg-yellow-100 text-gray-900' :
                                    color === 'U' ? 'bg-blue-500 text-white' :
                                    color === 'B' ? 'bg-gray-900 text-white border-gray-400' :
                                    color === 'R' ? 'bg-red-500 text-white' :
                                    'bg-green-500 text-white'
                                  }`}
                                  title={`Mana ${color}`}
                                >
                                  {color}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateDeck(deck.id)
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20"
                          title="Duplicar deck"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDeck(deck.id)
                            setViewMode('builder')
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-green-900/20"
                          title="Editar deck"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (confirm(`Tem certeza que deseja deletar o deck "${deck.name}"?`)) {
                              handleDeleteDeck(deck.id)
                            }
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                          title="Deletar deck"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Estatísticas rápidas */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-blue-400 font-bold text-xl">{totalCards}</div>
                        <div className="text-gray-400 text-xs">Total de Cartas</div>
                      </div>
                      <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                        <div className="text-green-400 font-bold text-xl">{avgCmc}</div>
                        <div className="text-gray-400 text-xs">CMC Médio</div>
                      </div>
                    </div>

                    {/* Distribuição por tipos */}
                    <div className="space-y-2">
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Composição</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {creatures > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Criaturas</span>
                            <span className="text-green-400 font-medium">{creatures}</span>
                          </div>
                        )}
                        {instants > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Instantes</span>
                            <span className="text-blue-400 font-medium">{instants}</span>
                          </div>
                        )}
                        {sorceries > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Feitiços</span>
                            <span className="text-red-400 font-medium">{sorceries}</span>
                          </div>
                        )}
                        {lands > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Terrenos</span>
                            <span className="text-yellow-400 font-medium">{lands}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Descrição */}
                    {deck.description && (
                      <div className="border-t border-gray-700/50 pt-3">
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {deck.description}
                        </p>
                      </div>
                    )}

                    {/* Ações principais */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDeck(deck.id)
                          setViewMode('viewer')
                        }}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 btn-gradient transition-all duration-200"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Visualizar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDeck(deck.id)
                          setViewMode('builder')
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Editar
                      </Button>
                    </div>
                    
                    {/* Data de modificação */}
                    <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700/30">
                      Modificado em {new Date(deck.lastModified || deck.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
