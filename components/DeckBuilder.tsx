"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { getImageUrl } from '@/utils/imageService';
import { searchCardsWithTranslation } from '@/utils/scryfallService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCardModal } from '@/contexts/CardModalContext';
import SearchCardList from '@/components/SearchCardList';
import DeckImporter from '@/components/DeckImporter';
import { 
  Search, Plus, Minus, X, Save, Settings, Target, 
  Library, Download, RefreshCw, AlertCircle, Loader2,
  Grid3X3, List, Filter, Package, Eye, Info
} from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';

// Componente interno para exibir cartas da coleção
interface CollectionDisplayProps {
  searchTerm: string;
  raridade: string;
  tipo: string;
  onAddCard: (card: MTGCard, category?: 'mainboard' | 'sideboard' | 'commander', quantity?: number) => void;
  currentDeck: any;
  currentCollection: any;
}

const CollectionDisplay: React.FC<CollectionDisplayProps> = ({ 
  searchTerm, 
  raridade, 
  tipo, 
  onAddCard, 
  currentDeck, 
  currentCollection 
}) => {
  const [addingCard, setAddingCard] = useState<string | null>(null);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  // Enhanced onAddCard with visual feedback
  const handleAddCard = async (card: MTGCard, zone: 'mainboard' | 'sideboard' | 'commander', quantity: number) => {
    try {
      setAddingCard(card.id);
      await onAddCard(card, zone, quantity);
      
      // Visual feedback for successful addition
      setRecentlyAdded(prev => new Set(prev.add(card.id)));
      setTimeout(() => {
        setRecentlyAdded(prev => {
          const newSet = new Set(prev);
          newSet.delete(card.id);
          return newSet;
        });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao adicionar carta:', error);
    } finally {
      setAddingCard(null);
    }
  };
  // Filtrar cartas da coleção
  const filteredCards = useMemo(() => {
    let filtered = currentCollection.cards;

    // Filtro por nome com suporte a tradução PT-BR para EN
    if (searchTerm.trim()) {
      filtered = filtered.filter((collectionCard: any) => 
        cardMatchesSearchTerm(collectionCard.card, searchTerm)
      );
    }

    // Filtro por raridade
    if (raridade !== 'all') {
      filtered = filtered.filter((collectionCard: any) => 
        collectionCard.card.rarity === raridade
      );
    }

    // Filtro por tipo
    if (tipo !== 'all') {
      filtered = filtered.filter((collectionCard: any) => 
        collectionCard.card.type_line.toLowerCase().includes(tipo)
      );
    }

    return filtered;
  }, [currentCollection.cards, searchTerm, raridade, tipo]);

  if (filteredCards.length === 0) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="text-center py-12">
          <Library className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-medium text-white mb-2">Nenhuma carta encontrada</h3>
          <p className="text-gray-400">
            {searchTerm.trim() || raridade !== 'all' || tipo !== 'all' 
              ? 'Tente ajustar os filtros' 
              : 'Sua coleção está vazia'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
      {filteredCards.map((collectionCard: any) => {
        const card = collectionCard.card;
        const inDeck = currentDeck.cards.find((dc: any) => dc.card.id === card.id);
        const isRecentlyAdded = recentlyAdded.has(card.id);
        
        return (
          <Card 
            key={card.id} 
            className={`bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50 transition-all duration-200 ${
              isRecentlyAdded ? 'border-green-500/70 shadow-lg shadow-green-500/20' : ''
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex gap-2 sm:gap-3">
                {/* Imagem da carta */}
                <div className="flex-shrink-0">
                  {getCardImage(card) && (
                    <div className="relative">
                      <Image
                        src={getCardImage(card)}
                        alt={card.name}
                        width={50}
                        height={70}
                        className="rounded border border-gray-600 sm:w-[60px] sm:h-[84px]"
                      />
                      {isRecentlyAdded && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Plus className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Informações da carta */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-xs sm:text-sm truncate mb-1" title={card.name}>
                    {card.name}
                  </h4>
                  <p className="text-xs text-gray-400 mb-1 truncate" title={card.set_name}>
                    {card.set_name}
                  </p>
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2 sm:line-clamp-1" title={card.type_line}>
                    {card.type_line}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs h-5">
                        {collectionCard.quantity}x coleção
                      </Badge>
                      {inDeck && (
                        <Badge variant="outline" className="text-xs h-5 border-green-600 text-green-400">
                          {inDeck.quantity}x deck
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Botões de adicionar */}
                  <div className="flex gap-1 mt-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => handleAddCard(card, 'mainboard', 1)}
                      disabled={addingCard === card.id}
                      className={`h-6 px-2 text-xs transition-all duration-200 flex-shrink-0 ${
                        recentlyAdded.has(card.id) 
                          ? 'bg-green-500 hover:bg-green-600 shadow-md scale-105' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {addingCard === card.id ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      <span className="hidden sm:inline">Principal</span>
                      <span className="sm:hidden">Main</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddCard(card, 'sideboard', 1)}
                      disabled={addingCard === card.id}
                      className={`h-6 px-2 text-xs transition-all duration-200 flex-shrink-0 ${
                        recentlyAdded.has(card.id)
                          ? 'border-green-500 text-green-400 bg-green-900/20 shadow-md scale-105'
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {addingCard === card.id ? (
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Plus className="w-3 h-3 mr-1" />
                      )}
                      Side
                    </Button>
                    {currentDeck.format === 'Commander' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddCard(card, 'commander', 1)}
                        disabled={addingCard === card.id}
                        className={`h-6 px-2 text-xs transition-all duration-200 flex-shrink-0 ${
                          recentlyAdded.has(card.id)
                            ? 'border-yellow-400 text-yellow-300 bg-yellow-900/30 shadow-md scale-105'
                            : 'border-yellow-600 text-yellow-400 hover:bg-yellow-900/20'
                        }`}
                      >
                        {addingCard === card.id ? (
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <Plus className="w-3 h-3 mr-1" />
                        )}
                        Cmd
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

interface DeckBuilderProps {
  deckId?: string; // Para editar deck existente
  onSave?: (deckId: string) => void;
  onCancel?: () => void;
}

// Função para obter imagem da carta
const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  return getImageUrl(card, size);
};

const DeckBuilder: React.FC<DeckBuilderProps> = ({ deckId, onSave, onCancel }) => {
  const { decks, criarDeck, editarDeck, adicionarCartaAoDeck, removerCartaDoDeck, atualizarQuantidadeNoDeck, currentCollection } = useAppContext();
  const { openModal } = useCardModal();
  
  const existingDeck = deckId ? decks.find(d => d.id === deckId) : null;
  
  // Estados do deck sendo construído/editado
  const [deckInfo, setDeckInfo] = useState({
    name: existingDeck?.name || '',
    format: existingDeck?.format || 'Standard',
    description: existingDeck?.description || '',
    colors: existingDeck?.colors || [],
    tags: existingDeck?.tags || [],
    isPublic: existingDeck?.isPublic || false
  });
  
  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [raridade, setRaridade] = useState('all');
  const [tipo, setTipo] = useState('all');
  const [cmc, setCmc] = useState('');
  const [manaColors, setManaColors] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<MTGCard[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Estados de visualização
  const [activeTab, setActiveTab] = useState<'search' | 'collection' | 'deck'>('search');
  const [deckViewCategory, setDeckViewCategory] = useState<'all' | 'mainboard' | 'sideboard' | 'commander'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Obter deck atual (seja novo ou existente)
  const currentDeck = existingDeck || { id: 'temp', cards: [], ...deckInfo, createdAt: '', lastModified: '' };
  
  // Filtrar cartas do deck por categoria
  const filteredDeckCards = useMemo(() => {
    if (deckViewCategory === 'all') return currentDeck.cards;
    return currentDeck.cards.filter(card => card.category === deckViewCategory);
  }, [currentDeck.cards, deckViewCategory]);
  
  // Estatísticas do deck
  const deckStats = useMemo(() => {
    const mainboard = currentDeck.cards.filter(c => c.category === 'mainboard');
    const sideboard = currentDeck.cards.filter(c => c.category === 'sideboard');
    const commander = currentDeck.cards.filter(c => c.category === 'commander');
    
    const mainboardCount = mainboard.reduce((sum, c) => sum + c.quantity, 0);
    const sideboardCount = sideboard.reduce((sum, c) => sum + c.quantity, 0);
    const commanderCount = commander.reduce((sum, c) => sum + c.quantity, 0);
    
    return {
      mainboard: mainboardCount,
      sideboard: sideboardCount,
      commander: commanderCount,
      total: mainboardCount + sideboardCount + commanderCount,
      unique: currentDeck.cards.length
    };
  }, [currentDeck.cards]);
  
  // Buscar cartas na API Scryfall
  const searchCards = useCallback(async () => {
    if (!searchTerm.trim() && raridade === 'all' && tipo === 'all' && !cmc && manaColors.length === 0) {
      setSearchError('Por favor, defina pelo menos um filtro para pesquisar');
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      let queryParts = [];
      
      if (searchTerm.trim()) queryParts.push(encodeURIComponent(searchTerm.trim()));
      if (raridade !== 'all') queryParts.push(`rarity:${raridade}`);
      if (tipo !== 'all') queryParts.push(`type:${tipo}`);
      if (cmc) queryParts.push(`cmc:${cmc}`);
      if (manaColors.length > 0) {
        const colorQuery = manaColors.map(c => `c:${c}`).join('');
        queryParts.push(colorQuery);
      }
      
      const query = queryParts.join('+');
      
      // Usar o serviço de tradução para busca na API
      const response = await searchCardsWithTranslation(query);
      const data = await response.json();
      
      if (response.ok && data.data) {
        setSearchResults(data.data);
        setSearchError(null);
      } else {
        setSearchResults([]);
        setSearchError(data.details || 'Nenhuma carta encontrada');
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      setSearchResults([]);
      setSearchError('Erro ao pesquisar cartas. Verifique sua conexão.');
    } finally {
      setIsSearching(false);
    }
  }, [searchTerm, raridade, tipo, cmc, manaColors]);
  
  // Adicionar carta ao deck
  const handleAddCardToDeck = useCallback((card: MTGCard, category: 'mainboard' | 'sideboard' | 'commander' = 'mainboard', quantity = 1) => {
    if (existingDeck) {
      adicionarCartaAoDeck(existingDeck.id, card, category, quantity);
    } else {
      // Para deck novo, gerenciar estado local
      // TODO: Implementar lógica para deck temporário
      console.log('Adicionando carta ao deck temporário:', card.name);
    }
  }, [existingDeck, adicionarCartaAoDeck]);
  
  // Remover carta do deck
  const handleRemoveCardFromDeck = useCallback((cardId: string, category: 'mainboard' | 'sideboard' | 'commander') => {
    if (existingDeck) {
      removerCartaDoDeck(existingDeck.id, cardId, category);
    }
  }, [existingDeck, removerCartaDoDeck]);
  
  // Atualizar quantidade no deck
  const handleUpdateQuantity = useCallback((cardId: string, category: 'mainboard' | 'sideboard' | 'commander', newQuantity: number) => {
    if (existingDeck) {
      atualizarQuantidadeNoDeck(existingDeck.id, cardId, newQuantity, category);
    }
  }, [existingDeck, atualizarQuantidadeNoDeck]);
  
  // Salvar deck
  const handleSaveDeck = useCallback(() => {
    if (!deckInfo.name.trim()) {
      alert('Por favor, digite um nome para o deck');
      return;
    }
    
    if (existingDeck) {
      editarDeck(existingDeck.id, deckInfo);
      if (onSave) onSave(existingDeck.id);
    } else {
      const newDeckId = criarDeck({
        name: deckInfo.name,
        format: deckInfo.format,
        description: deckInfo.description,
        colors: deckInfo.colors,
        cards: [],
        isPublic: deckInfo.isPublic,
        tags: deckInfo.tags
      });
      if (onSave) onSave(newDeckId);
    }
  }, [deckInfo, existingDeck, editarDeck, criarDeck, onSave]);
  
  // Limpar filtros de busca
  const clearSearchFilters = useCallback(() => {
    setSearchTerm('');
    setRaridade('all');
    setTipo('all');
    setCmc('');
    setManaColors([]);
    setSearchResults([]);
    setSearchError(null);
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {existingDeck ? `Editando: ${existingDeck.name}` : 'Construtor de Decks'}
          </h1>
          <p className="text-gray-400">
            {existingDeck ? 'Faça alterações no seu deck' : 'Crie e personalize seu novo deck'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DeckImporter 
            onImportSuccess={() => {/* TODO: Refresh deck list */}}
            onImportError={(error) => console.error(error)}
          />
          
          <Button
            onClick={handleSaveDeck}
            disabled={!deckInfo.name.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {existingDeck ? 'Salvar Alterações' : 'Salvar Deck'}
          </Button>
          
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancelar
            </Button>
          )}
        </div>
      </div>
      
      {/* Informações do Deck */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Informações do Deck</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Deck *</label>
              <Input
                value={deckInfo.name}
                onChange={(e) => setDeckInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do deck..."
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Formato</label>
              <Select value={deckInfo.format} onValueChange={(value) => setDeckInfo(prev => ({ ...prev, format: value }))}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Standard', 'Pioneer', 'Modern', 'Legacy', 'Vintage', 'Commander', 'Historic', 'Pauper', 'Brawl', 'Casual'].map(format => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <Textarea
              value={deckInfo.description}
              onChange={(e) => setDeckInfo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva a estratégia do seu deck..."
              className="bg-gray-700/50 border-gray-600 text-white"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cores do Deck</label>
            <div className="flex flex-wrap gap-2">
              {['W', 'U', 'B', 'R', 'G'].map(color => (
                <Button
                  key={color}
                  size="sm"
                  variant={deckInfo.colors.includes(color) ? 'default' : 'outline'}
                  onClick={() => {
                    setDeckInfo(prev => ({
                      ...prev,
                      colors: prev.colors.includes(color)
                        ? prev.colors.filter(c => c !== color)
                        : [...prev.colors, color]
                    }));
                  }}
                  className={`text-xs ${
                    deckInfo.colors.includes(color)
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {color === 'W' ? 'Branco' :
                   color === 'U' ? 'Azul' :
                   color === 'B' ? 'Preto' :
                   color === 'R' ? 'Vermelho' : 'Verde'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Estatísticas do Deck */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-white">{deckStats.total}</div>
            <div className="text-gray-400 text-sm">Total</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-blue-400">{deckStats.mainboard}</div>
            <div className="text-gray-400 text-sm">Principal</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-green-400">{deckStats.sideboard}</div>
            <div className="text-gray-400 text-sm">Sideboard</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-purple-400">{deckStats.commander}</div>
            <div className="text-gray-400 text-sm">Commander</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs principais */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={activeTab === 'search' ? 'default' : 'outline'}
              onClick={() => setActiveTab('search')}
              className={`flex-1 ${activeTab === 'search' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}`}
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar Cartas
            </Button>
            
            <Button
              variant={activeTab === 'collection' ? 'default' : 'outline'}
              onClick={() => setActiveTab('collection')}
              className={`flex-1 ${activeTab === 'collection' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}`}
            >
              <Library className="w-4 h-4 mr-2" />
              Da Coleção
            </Button>
            
            <Button
              variant={activeTab === 'deck' ? 'default' : 'outline'}
              onClick={() => setActiveTab('deck')}
              className={`flex-1 ${activeTab === 'deck' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}`}
            >
              <Target className="w-4 h-4 mr-2" />
              Deck Atual ({deckStats.total})
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Conteúdo das Tabs */}
      {activeTab === 'search' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros de Busca */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Filtros</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSearchFilters}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome da carta</label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchCards()}
                  placeholder="Nome da carta..."
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Raridade</label>
                <Select value={raridade} onValueChange={setRaridade}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="common">Comum</SelectItem>
                    <SelectItem value="uncommon">Incomum</SelectItem>
                    <SelectItem value="rare">Rara</SelectItem>
                    <SelectItem value="mythic">Mítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="creature">Criatura</SelectItem>
                    <SelectItem value="instant">Instantâneo</SelectItem>
                    <SelectItem value="sorcery">Feitiço</SelectItem>
                    <SelectItem value="artifact">Artefato</SelectItem>
                    <SelectItem value="enchantment">Encantamento</SelectItem>
                    <SelectItem value="planeswalker">Planeswalker</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CMC</label>
                <Input
                  value={cmc}
                  onChange={(e) => setCmc(e.target.value)}
                  placeholder="Ex: 3, <=2, >=4"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cores</label>
                <div className="flex flex-wrap gap-2">
                  {['W', 'U', 'B', 'R', 'G'].map(color => (
                    <Button
                      key={color}
                      size="sm"
                      variant={manaColors.includes(color) ? 'default' : 'outline'}
                      onClick={() => {
                        setManaColors(prev => 
                          prev.includes(color) 
                            ? prev.filter(c => c !== color)
                            : [...prev, color]
                        );
                      }}
                      className={`text-xs ${
                        manaColors.includes(color)
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {color}
                    </Button>
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={searchCards}
                disabled={isSearching}
              >
                <Search className="w-4 h-4 mr-2" />
                {isSearching ? 'Buscando...' : 'Buscar Cartas'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Resultados da Busca */}
          <div className="lg:col-span-3">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Resultados da Busca {searchResults.length > 0 && `(${searchResults.length})`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="min-h-[200px]">
                  {isSearching && (
                    <div className="text-center py-12 text-gray-400">
                      <Loader2 className="w-12 h-12 mx-auto mb-4 opacity-50 animate-spin" />
                      <p>Pesquisando cartas...</p>
                    </div>
                  )}
                  
                  {!isSearching && searchError && (
                    <div className="text-center py-12 text-gray-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-red-400" />
                      <p className="text-red-400">{searchError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={searchCards}
                        className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Tentar novamente
                      </Button>
                    </div>
                  )}
                  
                  {!isSearching && !searchError && searchResults.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Use os filtros ao lado para pesquisar cartas</p>
                    </div>
                  )}
                  
                  {!isSearching && !searchError && searchResults.length > 0 && (
                    <SearchCardList 
                      cards={searchResults}
                      collection={[]} // Empty since we're in deck builder
                      onAddCard={(card, quantity) => handleAddCardToDeck(card, 'mainboard', quantity)}
                      className="mb-6"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      
      {activeTab === 'collection' && (
        <div className="space-y-4">
          {/* Header da coleção */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Library className="w-5 h-5" />
                Minha Coleção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-sm mb-4">
                Selecione cartas da sua coleção para adicionar ao deck
              </p>
              
              {/* Estatísticas da coleção */}
              {currentCollection && (
                <div className="flex items-center gap-4 mb-4 p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      <span className="font-semibold text-white">{currentCollection.cards.length}</span> cartas únicas
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">
                      <span className="font-semibold text-white">
                        {currentCollection.cards.reduce((sum: number, card: any) => sum + card.quantity, 0)}
                      </span> cartas totais
                    </span>
                  </div>
                </div>
              )}
              
              {/* Filtros da coleção */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  placeholder="Buscar na coleção..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-900/50 border-gray-600 text-white"
                />
                <Select value={raridade} onValueChange={setRaridade}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                    <SelectValue placeholder="Raridade" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="common">Comum</SelectItem>
                    <SelectItem value="uncommon">Incomum</SelectItem>
                    <SelectItem value="rare">Rara</SelectItem>
                    <SelectItem value="mythic">Mítica</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600 text-white">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="creature">Criatura</SelectItem>
                    <SelectItem value="instant">Mágica Instantânea</SelectItem>
                    <SelectItem value="sorcery">Feitiço</SelectItem>
                    <SelectItem value="artifact">Artefato</SelectItem>
                    <SelectItem value="enchantment">Encantamento</SelectItem>
                    <SelectItem value="planeswalker">Planeswalker</SelectItem>
                    <SelectItem value="land">Terreno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de cartas da coleção */}
          <CollectionDisplay 
            searchTerm={searchTerm}
            raridade={raridade}
            tipo={tipo}
            onAddCard={handleAddCardToDeck}
            currentDeck={currentDeck}
            currentCollection={currentCollection}
          />
        </div>
      )}
      
      {activeTab === 'deck' && (
        <div className="space-y-4">
          {/* Controles do Deck */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={deckViewCategory} onValueChange={(value: any) => setDeckViewCategory(value)}>
                <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cartas</SelectItem>
                  <SelectItem value="mainboard">Deck Principal</SelectItem>
                  <SelectItem value="sideboard">Sideboard</SelectItem>
                  <SelectItem value="commander">Commander</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Lista de Cartas do Deck */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              {filteredDeckCards.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma carta nesta categoria</p>
                  <p className="text-sm">Use a aba "Buscar Cartas" para adicionar cartas ao deck</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'
                  : 'space-y-3'
                }>
                  {filteredDeckCards.map(deckCard => {
                    const imageUrl = getCardImage(deckCard.card, 'small');
                    
                    if (viewMode === 'grid') {
                      return (
                        <Card key={`${deckCard.card.id}-${deckCard.category}`} className="bg-gray-800/50 border-gray-700 hover:border-blue-500 transition-colors">
                          <CardContent className="p-2">
                            <div className="relative">
                              <div className="aspect-[63/88] bg-gray-900 rounded overflow-hidden mb-2">
                                {imageUrl ? (
                                  <Image
                                    src={imageUrl}
                                    alt={deckCard.card.name}
                                    fill
                                    className="object-cover cursor-pointer hover:scale-105 transition-transform"
                                    onClick={() => openModal(deckCard.card)}
                                    sizes="150px"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                                    {deckCard.card.name}
                                  </div>
                                )}
                              </div>
                              
                              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                {deckCard.quantity}
                              </div>
                              
                              <div className="text-xs">
                                <p className="text-white font-medium truncate">{deckCard.card.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {deckCard.category}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }

                    return (
                      <div key={`${deckCard.card.id}-${deckCard.category}`} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors group">
                        <div className="w-12 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={deckCard.card.name}
                              width={48}
                              height={64}
                              className="object-cover cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => openModal(deckCard.card)}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xs text-gray-500 text-center">{deckCard.card.set_code}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{deckCard.card.name}</h4>
                          <p className="text-gray-400 text-sm truncate">{deckCard.card.type_line}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {deckCard.category}
                            </Badge>
                            <span className="text-gray-500 text-xs">{deckCard.card.set_name}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 bg-gray-700 rounded">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity - 1)}
                              className="h-8 w-8 p-0 hover:bg-red-600"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="text-white text-sm w-8 text-center">{deckCard.quantity}</span>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity + 1)}
                              className="h-8 w-8 p-0 hover:bg-green-600"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveCardFromDeck(deckCard.card.id, deckCard.category)}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-600/20"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeckBuilder;
