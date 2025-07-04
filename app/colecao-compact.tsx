"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCardModal } from "@/contexts/CardModalContext"
import { useAppContext } from "@/contexts/AppContext"
import CardViewOptions from "@/components/CardViewOptions"
import CardList from "@/components/CardList"
import SearchCardList from "@/components/SearchCardList"
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService'
import { getImageUrl, getDoubleFacedImageUrls } from '@/utils/imageService'
import { searchCardsWithTranslation, getAllPrintsByNameWithTranslation } from '@/utils/scryfallService'
import ExpandableCardGrid from '@/components/ExpandableCardGrid'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Search, Library, Plus, Minus, Download, AlertCircle, Save, Upload, Copy, Grid3X3, Settings, User, Clock, Bookmark, Heart, Trash2, Star, Filter, Eye, EyeOff, RefreshCw, ExternalLink, Package, Edit3 } from "lucide-react"
import "@/styles/palette.css"

// Função utilitária para seguramente acessar propriedades de cartas
const safeCardAccess = {
  setCode: (card: any): string => {
    try {
      if (!card) return 'N/A';
      if (card.set_code === undefined || card.set_code === null) return 'N/A';
      if (typeof card.set_code !== 'string') return String(card.set_code);
      return card.set_code.toUpperCase();
    } catch (e) {
      console.warn('Erro ao acessar set_code', e);
      return 'N/A';
    }
  },
  rarity: (card: any): string => {
    try {
      if (!card) return 'comum';
      return card.rarity || 'comum';
    } catch (e) {
      console.warn('Erro ao acessar rarity', e);
      return 'comum';
    }
  },
  typeLine: (card: any): string => {
    try {
      if (!card) return 'Tipo não especificado';
      return card.type_line || 'Tipo não especificado';
    } catch (e) {
      console.warn('Erro ao acessar type_line', e);
      return 'Tipo não especificado';
    }
  },
  setName: (card: any): string => {
    try {
      if (!card) return 'Coleção desconhecida';
      return card.set_name || 'Coleção desconhecida';
    } catch (e) {
      console.warn('Erro ao acessar set_name', e);
      return 'Coleção desconhecida';
    }
  },
  colorIdentity: (card: any): string[] => {
    try {
      if (!card) return [];
      if (!card.color_identity || !Array.isArray(card.color_identity)) return [];
      return card.color_identity;
    } catch (e) {
      console.warn('Erro ao acessar color_identity', e);
      return [];
    }
  },
  imageUris: (card: any): any => {
    try {
      if (!card) return null;
      return card.image_uris || null;
    } catch (e) {
      console.warn('Erro ao acessar image_uris', e);
      return null;
    }
  },
  cmc: (card: any): number => {
    try {
      if (!card) return 0;
      if (card.cmc === undefined || card.cmc === null) return 0;
      return Number(card.cmc) || 0;
    } catch (e) {
      console.warn('Erro ao acessar cmc', e);
      return 0;
    }
  }
}

// Tipos essenciais para coleção
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
  card_faces?: Array<{
    name: string
    mana_cost?: string
    type_line: string
    oracle_text?: string
    power?: string
    toughness?: string
    image_uris?: {
      normal: string
      small?: string
      art_crop?: string
    }
  }>
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

interface ColecaoProps {
  allCards: MTGCard[]
  setAllCards: (cards: MTGCard[]) => void
  exportCollectionToCSV: (collection: UserCollection) => void
}

// Constantes para filtros
const raridades = ["all", "common", "uncommon", "rare", "mythic", "special", "bonus"]
const tipos = [
  "all", "creature", "artifact", "enchantment", "instant", "sorcery", 
  "planeswalker", "land", "token", "artifact creature", "enchantment creature"
]
const subtipos = [
  "all", "elf", "goblin", "zombie", "angel", "dragon", "vampire", "wizard", 
  "warrior", "human", "beast", "spirit", "sliver", "merfolk", "dinosaur", 
  "giant", "elemental", "knight", "soldier", "rogue", "cleric"
]
const supertipos = ["all", "legendary", "basic", "snow", "world", "ongoing"]
const foils = ["all", "foil", "nonfoil"]
const coresMana = ["W", "U", "B", "R", "G", "C"]

export default function ColecaoCompact({
  allCards,
  setAllCards,
  exportCollectionToCSV,
}: ColecaoProps) {
  // Usar o contexto global para coleção
  const { currentCollection, adicionarCarta, removerCarta } = useAppContext();
  
  // Estados para navegação entre tabs da coleção - apenas Pesquisa, Coleção e Estatísticas
  const [tab, setTab] = useState<string>("pesquisa")
  const [busca, setBusca] = useState("")
  const [raridade, setRaridade] = useState("all")
  const [tipo, setTipo] = useState("all")
  const [subtipo, setSubtipo] = useState("all")
  const [supertipo, setSupertipo] = useState("all")
  const [cmc, setCmc] = useState("")
  const [foil, setFoil] = useState("all")
  const [oracleText, setOracleText] = useState("")
  const [manaColors, setManaColors] = useState<string[]>([])
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false)
  const [mostrarCartasNaColecao, setMostrarCartasNaColecao] = useState(false)
  
  // Estados para ordenação e filtros da coleção
  const [ordenacao, setOrdenacao] = useState<'name' | 'rarity' | 'cmc' | 'quantity' | 'date'>('name')
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('asc')
  const [filtroRaridadeColecao, setFiltroRaridadeColecao] = useState("all")
  const [filtroCorColecao, setFiltroCorColecao] = useState("all")
  const [buscaColecao, setBuscaColecao] = useState("")
  
  const [resultadoPesquisa, setResultadoPesquisa] = useState<MTGCard[]>([])
  const [carregandoPesquisa, setCarregandoPesquisa] = useState(false)
  const [erroPesquisa, setErroPesquisa] = useState<string | null>(null)
  
  // Estados para busca rápida e histórico
  const [buscaRapida, setBuscaRapida] = useState("")
  const [historicoMensagens, setHistoricoMensagens] = useState<string[]>([])
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  // Sugestões de busca com base no histórico e cartas populares
  const sugestoesBusca = useMemo(() => {
    const cartasPopulares = ['Lightning Bolt', 'Counterspell', 'Sol Ring', 'Swords to Plowshares', 'Dark Ritual'];
    const cartasNaColecao = currentCollection.cards.map(c => c.card.name).slice(0, 5);
    const todasSugestoes = [...cartasPopulares, ...cartasNaColecao];
    return Array.from(new Set(todasSugestoes));
  }, [currentCollection.cards]);

  // Função para busca rápida (Enter na pesquisa)
  const buscarRapido = useCallback((termo: string) => {
    if (!termo.trim()) return;
    
    setBusca(termo);
    setTab("pesquisa");
    setMostrarSugestoes(false);
    
    // Adicionar ao histórico
    setHistoricoMensagens(prev => {
      const novoHistorico = [termo, ...prev.filter(h => h !== termo)].slice(0, 10);
      return novoHistorico;
    });
  }, []);

  // Estados para notificações/feedback
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    visible: boolean;
  }>({ type: 'info', message: '', visible: false })
  
  // Usando o modal global via contexto
  const { openModal } = useCardModal();

  // Função local para adicionar múltiplas cartas
  const adicionarMultiplasCartas = useCallback((card: MTGCard, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      adicionarCarta(card);
    }
    
    // Mostrar notificação de sucesso
    showNotification('success', `${quantity}x ${card.name} adicionada${quantity > 1 ? 's' : ''} à coleção!`);
  }, [adicionarCarta]);

  // Função para mostrar notificações
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Função melhorada para filtrar e ordenar cartas da coleção
  const cartasFiltradas = useMemo(() => {
    let filtered = currentCollection.cards;

    // Filtro por nome/busca
    if (buscaColecao.trim()) {
      const searchTerm = buscaColecao.trim();
      filtered = filtered.filter(c => cardMatchesSearchTerm(c.card, searchTerm));
    }

    // Filtro por raridade
    if (filtroRaridadeColecao !== "all") {
      filtered = filtered.filter(c => c.card.rarity === filtroRaridadeColecao);
    }

    // Filtro por cor
    if (filtroCorColecao !== "all") {
      if (filtroCorColecao === "colorless") {
        filtered = filtered.filter(c => 
          !c.card.color_identity || c.card.color_identity.length === 0
        );
      } else {
        filtered = filtered.filter(c => 
          c.card.color_identity && c.card.color_identity.includes(filtroCorColecao)
        );
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (ordenacao) {
        case 'name':
          comparison = a.card.name.localeCompare(b.card.name);
          break;
        case 'rarity':
          const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'mythic': 4 };
          comparison = (rarityOrder[a.card.rarity as keyof typeof rarityOrder] || 0) - 
                      (rarityOrder[b.card.rarity as keyof typeof rarityOrder] || 0);
          break;
        case 'cmc':
          comparison = (a.card.cmc || 0) - (b.card.cmc || 0);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'date':
          comparison = new Date(a.card.released_at || '').getTime() - 
                      new Date(b.card.released_at || '').getTime();
          break;
      }
      
      return direcaoOrdenacao === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [currentCollection.cards, buscaColecao, filtroRaridadeColecao, filtroCorColecao, ordenacao, direcaoOrdenacao]);

  // Função para alternar direção da ordenação
  const toggleOrdenacao = useCallback((novaOrdenacao: typeof ordenacao) => {
    if (ordenacao === novaOrdenacao) {
      setDirecaoOrdenacao(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(novaOrdenacao);
      setDirecaoOrdenacao('asc');
    }
  }, [ordenacao]);

  // Função para pesquisar cartas
  const pesquisarCartas = async () => {
    // Se não há filtros, não pesquisa
    if (!busca.trim() && raridade === "all" && tipo === "all" && 
        subtipo === "all" && supertipo === "all" && !cmc && 
        !oracleText && manaColors.length === 0 && foil === "all") {
      setErroPesquisa("Por favor, defina pelo menos um filtro para pesquisar")
      return
    }
    
    setCarregandoPesquisa(true)
    setErroPesquisa(null)
    
    try {
      // Construir query para Scryfall
      let queryParts = []
      
      if (busca.trim()) queryParts.push(encodeURIComponent(busca.trim()))
      if (raridade !== "all") queryParts.push(`rarity:${raridade}`)
      if (tipo !== "all") queryParts.push(`type:${tipo}`)
      if (subtipo !== "all") queryParts.push(`type:${subtipo}`)
      if (supertipo !== "all") queryParts.push(`is:${supertipo}`)
      if (cmc) {
        const cmcNumber = parseInt(cmc)
        if (!isNaN(cmcNumber)) {
          queryParts.push(`cmc=${cmcNumber}`)
        }
      }
      if (foil === "foil") queryParts.push("is:foil")
      if (foil === "nonfoil") queryParts.push("-is:foil")
      if (oracleText.trim()) queryParts.push(`oracle:"${encodeURIComponent(oracleText.trim())}"`)
      if (manaColors.length > 0) {
        queryParts.push(`colors:${manaColors.join("")}`)
      }
      
      const query = queryParts.join(" ")
      console.log("Query construída:", query)
      
      // Fazer requisição para Scryfall usando o serviço com tradução
      const response = await searchCardsWithTranslation(query)
      
      if (!response.ok) {
        if (response.status === 404) {
          setResultadoPesquisa([])
          setErroPesquisa("Nenhuma carta encontrada com os filtros especificados")
        } else {
          throw new Error(`Erro na API: ${response.status}`)
        }
        return
      }
      
      const data = await response.json()
      setResultadoPesquisa(data.data || [])
      
      if (data.data && data.data.length === 0) {
        setErroPesquisa("Nenhuma carta encontrada com os filtros especificados")
      }
      
    } catch (error) {
      console.error("Erro ao pesquisar cartas:", error)
      setErroPesquisa("Erro ao pesquisar cartas. Tente novamente.")
      setResultadoPesquisa([])
    } finally {
      setCarregandoPesquisa(false)
    }
  }

  // Função para limpar filtros
  const limparFiltros = () => {
    setBusca("")
    setRaridade("all")
    setTipo("all")
    setSubtipo("all")
    setSupertipo("all")
    setCmc("")
    setFoil("all")
    setOracleText("")
    setManaColors([])
    setResultadoPesquisa([])
    setErroPesquisa(null)
  }

  // Função para pesquisar ao pressionar Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      pesquisarCartas()
    }
  }

  // Função para toggle de cor de mana
  const toggleManaCor = (cor: string) => {
    setManaColors(prev => 
      prev.includes(cor) 
        ? prev.filter(c => c !== cor)
        : [...prev, cor]
    )
  }

  // Effect para pesquisar automaticamente quando o termo de busca muda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busca.trim() && busca.length >= 3) {
        pesquisarCartas()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [busca])

  // Função para capitalizar primeira letra
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Função para obter cor de raridade
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-400'
      case 'uncommon': return 'text-green-400'
      case 'rare': return 'text-yellow-400'
      case 'mythic': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="quantum-compact">
      {/* Notificação */}
      {notification.visible && (
        <div className={`quantum-notification ${
          notification.type === 'success' ? 'quantum-notification-success' :
          notification.type === 'error' ? 'quantum-notification-error' : 'quantum-notification-info'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Busca Rápida */}
      <div className="quantum-card-dense mb-2">
        <div className="p-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Busca rápida de cartas..."
              value={buscaRapida}
              onChange={(e) => {
                setBuscaRapida(e.target.value);
                setMostrarSugestoes(e.target.value.length > 0);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  buscarRapido(buscaRapida);
                }
              }}
              className="quantum-field"
            />
            <Search className="absolute right-2 top-2 w-4 h-4 text-gray-400" />
            
            {/* Sugestões */}
            {mostrarSugestoes && buscaRapida.length > 0 && (
              <div className="absolute top-full mt-1 w-full rounded-sm bg-gray-900/90 backdrop-blur-sm shadow-md overflow-hidden border border-gray-700/50 z-10">
                {sugestoesBusca
                  .filter(s => s.toLowerCase().includes(buscaRapida.toLowerCase()))
                  .slice(0, 5)
                  .map((sugestao, index) => (
                    <button
                      key={index}
                      onClick={() => buscarRapido(sugestao)}
                      className="w-full text-left px-2 py-1 text-sm hover:bg-gray-800/80 transition-colors"
                    >
                      {sugestao}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação de Tabs */}
      <div className="quantum-tabs mb-2">
        <button
          onClick={() => {
            setTab("pesquisa")
            setBusca("")
            setErroPesquisa(null)
            setResultadoPesquisa([])
          }}
          className={`quantum-tab ${tab === "pesquisa" ? "quantum-tab-active" : ""}`}
        >
          <Search className="w-3 h-3 mr-1" />
          Pesquisa
        </button>
        <button
          onClick={() => {
            setTab("colecao")
            setBusca("")
          }}
          className={`quantum-tab ${tab === "colecao" ? "quantum-tab-active" : ""}`}
        >
          <Library className="w-3 h-3 mr-1" />
          Coleção ({currentCollection.cards.length})
        </button>
        <button
          onClick={() => setTab("estatisticas")}
          className={`quantum-tab ${tab === "estatisticas" ? "quantum-tab-active" : ""}`}
        >
          <Star className="w-3 h-3 mr-1" />
          Estatísticas
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {tab === "pesquisa" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
          {/* Coluna 1: Filtros */}
          <div className="lg:col-span-1">
            <div className="quantum-card-dense p-2">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3 h-3 text-cyan-400" />
                <h3 className="text-sm font-medium text-white">Filtros</h3>
              </div>
              
              <div className="space-y-2">
                {/* Busca por nome */}
                <div>
                  <label className="quantum-label">Nome</label>
                  <Input
                    type="text"
                    placeholder="Ex: Lightning Bolt"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="quantum-field-sm"
                  />
                </div>

                {/* Filtros básicos */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="quantum-label">Raridade</label>
                    <Select value={raridade} onValueChange={setRaridade}>
                      <SelectTrigger className="quantum-field-sm h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {raridades.map(r => (
                          <SelectItem key={r} value={r}>
                            {r === "all" ? "Todas" : capitalize(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="quantum-label">Tipo</label>
                    <Select value={tipo} onValueChange={setTipo}>
                      <SelectTrigger className="quantum-field-sm h-7">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {tipos.map(t => (
                          <SelectItem key={t} value={t}>
                            {t === "all" ? "Todos" : capitalize(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botão para mostrar filtros avançados */}
                <Button
                  variant="outline"
                  onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
                  className="quantum-btn w-full text-xs h-7"
                  size="sm"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  {mostrarFiltrosAvancados ? "Ocultar" : "Mais"} Filtros
                </Button>

                {/* Filtros avançados */}
                {mostrarFiltrosAvancados && (
                  <div className="space-y-2 pt-2 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="quantum-label">Subtipo</label>
                        <Select value={subtipo} onValueChange={setSubtipo}>
                          <SelectTrigger className="quantum-field-sm h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {subtipos.map(st => (
                              <SelectItem key={st} value={st}>
                                {st === "all" ? "Todos" : capitalize(st)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="quantum-label">CMC</label>
                        <Input
                          type="number"
                          placeholder="Ex: 3"
                          value={cmc}
                          onChange={(e) => setCmc(e.target.value)}
                          className="quantum-field-sm h-7"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="quantum-label">Supertipo</label>
                        <Select value={supertipo} onValueChange={setSupertipo}>
                          <SelectTrigger className="quantum-field-sm h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {supertipos.map(st => (
                              <SelectItem key={st} value={st}>
                                {st === "all" ? "Todos" : capitalize(st)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="quantum-label">Foil</label>
                        <Select value={foil} onValueChange={setFoil}>
                          <SelectTrigger className="quantum-field-sm h-7">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {foils.map(f => (
                              <SelectItem key={f} value={f}>
                                {f === "all" ? "Todas" : f === "foil" ? "Foil" : "Normal"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="quantum-label">Texto Oracle</label>
                      <Textarea
                        placeholder="Ex: exile target creature"
                        value={oracleText}
                        onChange={(e) => setOracleText(e.target.value)}
                        className="quantum-field-sm"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="quantum-label">Cores</label>
                      <div className="flex flex-wrap gap-1">
                        {coresMana.map(cor => (
                          <Button
                            key={cor}
                            variant={manaColors.includes(cor) ? "default" : "outline"}
                            onClick={() => toggleManaCor(cor)}
                            className={`w-6 h-6 p-0 text-xs ${
                              manaColors.includes(cor)
                                ? cor === 'W' ? 'bg-yellow-200 text-gray-900' :
                                  cor === 'U' ? 'bg-blue-500' :
                                  cor === 'B' ? 'bg-gray-900 text-white border-gray-600' :
                                  cor === 'R' ? 'bg-red-500' :
                                  cor === 'G' ? 'bg-green-500' :
                                  'bg-gray-400'
                                : 'border-gray-600 text-gray-300'
                            }`}
                          >
                            {cor}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={pesquisarCartas}
                    disabled={carregandoPesquisa}
                    className="quantum-btn flex-1 compact primary"
                    size="sm"
                  >
                    {carregandoPesquisa ? (
                      <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Search className="w-3 h-3 mr-1" />
                    )}
                    Buscar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={limparFiltros}
                    className="quantum-btn"
                    size="sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {/* Opções de visualização */}
                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="mostrarCartasNaColecao"
                    checked={mostrarCartasNaColecao}
                    onChange={(e) => setMostrarCartasNaColecao(e.target.checked)}
                    className="mr-1 h-3 w-3"
                  />
                  <label htmlFor="mostrarCartasNaColecao" className="text-xs text-gray-400">
                    Destacar cartas na coleção
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna 2-4: Resultados */}
          <div className="lg:col-span-3">
            <div className="quantum-card-dense p-2">
              {erroPesquisa ? (
                <div className="text-center py-4">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-red-400 text-sm">{erroPesquisa}</p>
                  <Button onClick={pesquisarCartas} variant="outline" className="quantum-btn mt-2">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Tentar Novamente
                  </Button>
                </div>
              ) : carregandoPesquisa ? (
                <div className="text-center py-4">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
                  <p className="text-gray-400 text-sm">Pesquisando cartas...</p>
                </div>
              ) : resultadoPesquisa.length > 0 ? (
                <SearchCardList
                  cards={resultadoPesquisa}
                  collection={currentCollection.cards}
                  onAddCard={adicionarCarta}
                />
              ) : (
                <div className="text-center py-4">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                  <h3 className="text-sm font-medium text-white mb-1">Pesquise por cartas</h3>
                  <p className="text-gray-400 text-xs mb-3">
                    Use os filtros ao lado para encontrar cartas específicas
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => setBusca("Lightning Bolt")} className="quantum-btn text-xs h-7">
                      Lightning Bolt
                    </Button>
                    <Button onClick={() => setRaridade("mythic")} className="quantum-btn text-xs h-7">
                      Cartas Míticas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "colecao" && (
        <div className="space-y-2">
          {/* Header da Coleção */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="quantum-title">Minha Coleção</h2>
            </div>
            <Button
              onClick={() => exportCollectionToCSV(currentCollection)}
              className="quantum-btn compact"
              size="sm"
            >
              <Download className="w-3 h-3 mr-1" />
              Exportar
            </Button>
          </div>

          {/* Filtros da Coleção */}
          <div className="quantum-card-dense p-2 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Buscar na coleção..."
                value={buscaColecao}
                onChange={(e) => setBuscaColecao(e.target.value)}
                className="quantum-field-sm h-7"
              />
              <Select value={filtroRaridadeColecao} onValueChange={setFiltroRaridadeColecao}>
                <SelectTrigger className="quantum-field-sm h-7">
                  <SelectValue placeholder="Raridade" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="common">Comum</SelectItem>
                  <SelectItem value="uncommon">Incomum</SelectItem>
                  <SelectItem value="rare">Rara</SelectItem>
                  <SelectItem value="mythic">Mítica</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroCorColecao} onValueChange={setFiltroCorColecao}>
                <SelectTrigger className="quantum-field-sm h-7">
                  <SelectValue placeholder="Cor" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="W">Branco</SelectItem>
                  <SelectItem value="U">Azul</SelectItem>
                  <SelectItem value="B">Preto</SelectItem>
                  <SelectItem value="R">Vermelho</SelectItem>
                  <SelectItem value="G">Verde</SelectItem>
                  <SelectItem value="colorless">Incolor</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  onClick={() => toggleOrdenacao('name')}
                  className="quantum-btn compact flex-1"
                  size="sm"
                >
                  Nome {ordenacao === 'name' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toggleOrdenacao('rarity')}
                  className="quantum-btn compact flex-1"
                  size="sm"
                >
                  Raridade {ordenacao === 'rarity' && (direcaoOrdenacao === 'asc' ? '↑' : '↓')}
                </Button>
              </div>
            </div>
          </div>

          {/* Lista de Cartas da Coleção */}
          <div className="quantum-card-dense p-2">
            {cartasFiltradas.length === 0 ? (
              <div className="text-center py-4">
                <Library className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                <h3 className="text-sm font-medium text-white mb-1">Coleção vazia</h3>
                <p className="text-gray-400 text-xs mb-3">
                  Adicione cartas à sua coleção pesquisando na aba "Pesquisar"
                </p>
                <Button
                  onClick={() => setTab("pesquisa")}
                  className="quantum-btn primary"
                >
                  <Search className="w-3 h-3 mr-1" />
                  Pesquisar Cartas
                </Button>
              </div>
            ) : (
              <ExpandableCardGrid
                collectionCards={cartasFiltradas}
                onAddCard={adicionarCarta}
                onRemoveCard={removerCarta}
              />
            )}
          </div>
        </div>
      )}

      {tab === "estatisticas" && (
        <div className="space-y-2">
          {/* Estatísticas da Coleção */}
          <div className="quantum-grid-3">
            <div className="quantum-card-dense p-3 text-center">
              <Library className="w-5 h-5 mx-auto mb-1 text-blue-400" />
              <h3 className="text-lg font-bold text-white">{currentCollection.cards.length}</h3>
              <p className="text-gray-400 text-xs">Cartas únicas</p>
            </div>
            
            <div className="quantum-card-dense p-3 text-center">
              <Package className="w-5 h-5 mx-auto mb-1 text-green-400" />
              <h3 className="text-lg font-bold text-white">
                {currentCollection.cards.reduce((sum, c) => sum + c.quantity, 0)}
              </h3>
              <p className="text-gray-400 text-xs">Total de cartas</p>
            </div>
            
            <div className="quantum-card-dense p-3 text-center">
              <Star className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <h3 className="text-lg font-bold text-white">
                {new Set(currentCollection.cards.map(c => c.card.set_code)).size}
              </h3>
              <p className="text-gray-400 text-xs">Coleções diferentes</p>
            </div>
          </div>

          {/* Distribuição por Raridade */}
          <div className="quantum-card-dense p-3">
            <h3 className="quantum-card-title text-sm font-medium mb-2">Distribuição por Raridade</h3>
            <div className="space-y-2">
              {(['common', 'uncommon', 'rare', 'mythic'] as const).map(rarity => {
                const count = currentCollection.cards.filter(c => c.card.rarity === rarity).length;
                const percentage = currentCollection.cards.length > 0 
                  ? (count / currentCollection.cards.length * 100).toFixed(1) 
                  : '0';
                
                return (
                  <div key={rarity} className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${getRarityColor(rarity)}`}>
                      {capitalize(rarity)}
                    </span>
                    <div className="flex items-center gap-1">
                      <div className="w-24 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            rarity === 'common' ? 'bg-gray-400' :
                            rarity === 'uncommon' ? 'bg-green-400' :
                            rarity === 'rare' ? 'bg-yellow-400' :
                            'bg-orange-400'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-300 text-xs w-6 text-right">
                        {count}
                      </span>
                      <span className="text-gray-500 text-xs w-10 text-right">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 5 Coleções */}
          <div className="quantum-card-dense p-3">
            <h3 className="quantum-card-title text-sm font-medium mb-2">Top 5 Coleções</h3>
            <div className="space-y-1">
              {Object.entries(
                currentCollection.cards.reduce((acc, card) => {
                  const setName = card.card.set_name;
                  acc[setName] = (acc[setName] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              )
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([setName, count], index) => (
                  <div key={setName} className="flex justify-between items-center py-0.5">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs w-4">{index + 1}.</span>
                      <span className="text-white text-xs">{setName}</span>
                    </div>
                    <span className="quantum-microtag">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
