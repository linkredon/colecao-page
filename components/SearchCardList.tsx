"use client"

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCardModal } from '@/contexts/CardModalContext';
import DeckSelector from '@/components/DeckSelector';
import { Plus, Minus, Info, AlertCircle, Eye, ChevronDown, ChevronUp, Loader2, Search, Package } from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { getImageUrl, getDoubleFacedImageUrls } from '@/utils/imageService';
import { getAllPrintsByNameWithTranslation } from '@/utils/scryfallService';

interface CollectionCard {
  card: MTGCard;
  quantity: number;
  condition: string;
  foil: boolean;
}

interface SearchCardListProps {
  cards: MTGCard[];
  collection: CollectionCard[];
  onAddCard: (card: MTGCard, quantity?: number) => void;
  className?: string;
}

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
  setName: (card: any): string => {
    try {
      if (!card) return 'Coleção desconhecida';
      return card.set_name || 'Coleção desconhecida';
    } catch (e) {
      console.warn('Erro ao acessar set_name', e);
      return 'Coleção desconhecida';
    }
  }
};

// Função utilitária para obter a imagem da carta com fallback
const getCardImage = (card: MTGCard, size: 'small' | 'normal' = 'small'): string => {
  return getImageUrl(card, size);
};

// Componente para badge de quantidade com memo
const QuantityBadge = React.memo(({ card, collection }: { card: MTGCard; collection: CollectionCard[] }) => {
  const quantity = useMemo(() => {
    return collection
      .filter(item => item.card.id === card.id)
      .reduce((total, item) => total + item.quantity, 0);
  }, [card.id, collection]);

  if (quantity === 0) return null;

  return (
    <Badge 
      variant="secondary" 
      className="absolute top-2 left-2 bg-blue-600 text-white border-blue-500 z-10"
    >
      {quantity}x na coleção
    </Badge>
  );
});

QuantityBadge.displayName = 'QuantityBadge';

// Componente para controle de quantidade
const QuantityControl = React.memo(({ onAdd, compact = false }: { onAdd: (quantity: number) => void; compact?: boolean }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAdd = useCallback(() => {
    setIsAdding(true);
    onAdd(quantity);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout to reset adding state
    timeoutRef.current = setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  }, [quantity, onAdd]);

  const increaseQuantity = useCallback(() => {
    setQuantity(prev => prev + 1);
  }, []);

  const decreaseQuantity = useCallback(() => {
    setQuantity(prev => Math.max(1, prev - 1));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, value));
  }, []);

  if (compact) {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center border rounded text-xs">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={decreaseQuantity}
            className="h-6 w-6 p-0 text-xs"
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            className="w-8 h-6 text-center border-0 rounded-none text-xs p-0"
            min="1"
          />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={increaseQuantity}
            className="h-6 w-6 p-0 text-xs"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <Button 
          onClick={handleAdd}
          disabled={isAdding}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 h-6"
        >
          {isAdding ? 'OK' : `+${quantity}`}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={decreaseQuantity}
          className="h-8 w-8 p-0"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={quantity}
          onChange={handleInputChange}
          className="w-16 h-8 text-center border-0 rounded-none"
          min="1"
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={increaseQuantity}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <Button 
        onClick={handleAdd}
        disabled={isAdding}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isAdding ? 'Adicionando...' : `Adicionar ${quantity}x`}
      </Button>
    </div>
  );
});

QuantityControl.displayName = 'QuantityControl';

// Componente de carta individual
const SearchCardItem = React.memo(({ 
  card, 
  collection, 
  onAddCard,
  viewMode 
}: { 
  card: MTGCard; 
  collection: CollectionCard[];
  onAddCard: (card: MTGCard, quantity?: number) => void;
  viewMode: string;
}) => {
  const { openModal } = useCardModal();
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versionsData, setVersionsData] = useState<{
    versions: MTGCard[];
    loading: boolean;
    error: string | null;
  }>({ versions: [], loading: false, error: null });
  const [addingVersions, setAddingVersions] = useState<Record<string, boolean>>({});

  const imageUrl = useMemo(() => getCardImage(card, 'small'), [card]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleViewDetails = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    openModal(card);
  }, [card, openModal]);

  const handleAddCard = useCallback((quantity: number = 1) => {
    onAddCard(card, quantity);
  }, [card, onAddCard]);

  // Função para buscar versões alternativas
  const fetchVersions = useCallback(async () => {
    if (versionsData.loading) return;

    setVersionsData({ versions: [], loading: true, error: null });

    try {
      const response = await getAllPrintsByNameWithTranslation(card.name);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar versões');
      }

      const data = await response.json();
      const versions = data.data || [];
      
      // Filtrar a carta atual e versões já na coleção
      const collectionIds = new Set(collection.map(c => c.card.id));
      const filteredVersions = versions.filter((v: MTGCard) => 
        v.id !== card.id && !collectionIds.has(v.id)
      );

      setVersionsData({ 
        versions: filteredVersions, 
        loading: false, 
        error: null 
      });
    } catch (error) {
      console.error('Erro ao buscar versões:', error);
      setVersionsData({ 
        versions: [], 
        loading: false, 
        error: 'Erro ao buscar versões alternativas' 
      });
    }
  }, [card.name, card.id, collection]);

  // Função para alternar exibição de versões
  const toggleVersions = useCallback(async () => {
    const wasHidden = !showVersions;
    
    if (!showVersions && versionsData.versions.length === 0 && !versionsData.loading) {
      await fetchVersions();
    }
    setShowVersions(prev => !prev);

    // Scroll para o topo quando abrir o box de outras versões
    if (wasHidden) {
      setTimeout(() => {
        const element = document.querySelector(`[data-card-name="${card.id}"]`);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  }, [showVersions, versionsData, fetchVersions, card.id]);

  // Função para adicionar versão alternativa
  const handleAddVersion = useCallback(async (version: MTGCard, quantity: number = 1) => {
    setAddingVersions(prev => ({ ...prev, [version.id]: true }));
    
    try {
      onAddCard(version, quantity);
      
      // Remover versão da lista após adicionar
      setVersionsData(prev => ({
        ...prev,
        versions: prev.versions.filter(v => v.id !== version.id)
      }));
      
      // Feedback visual
      setTimeout(() => {
        setAddingVersions(prev => ({ ...prev, [version.id]: false }));
      }, 1000);
    } catch (error) {
      console.error('Erro ao adicionar versão:', error);
      setAddingVersions(prev => ({ ...prev, [version.id]: false }));
    }
  }, [onAddCard]);

  // Renderizar painel de versões alternativas
  const renderVersionsPanel = useCallback(() => {
    if (!showVersions) return null;

    return (
      <div className="mt-4 rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0">
        <div className="p-3 border-b border-gray-700/50">
          <h5 className="text-sm font-semibold text-white flex items-center gap-2">
            <Search className="w-4 h-4" />
            Outras versões de "{card.name}"
          </h5>
        </div>

        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {versionsData.loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-gray-300 text-sm">Buscando versões...</span>
            </div>
          ) : versionsData.error ? (
            <div className="text-red-400 text-sm flex items-center gap-2 py-4 px-3">
              <AlertCircle className="w-4 h-4" />
              <span>{versionsData.error}</span>
            </div>
          ) : versionsData.versions.length === 0 ? (
            <div className="text-gray-400 text-sm py-4 text-center">
              Nenhuma versão alternativa encontrada
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {versionsData.versions.map((version) => (
                <div 
                  key={version.id} 
                  className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors group"
                >
                  {/* Imagem miniatura */}
                  <div className="w-12 h-16 bg-gray-900 rounded overflow-hidden border border-gray-600 flex-shrink-0">
                    {getCardImage(version) ? (
                      <img
                        src={getCardImage(version)}
                        alt={version.name}
                        className="w-full h-full object-contain cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => openModal(version)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-500 text-center">
                          {safeCardAccess.setCode(version)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações da versão */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">
                      {safeCardAccess.setCode(version)}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {safeCardAccess.setName(version)}
                    </div>
                  </div>

                  {/* Controle de adicionar */}
                  <div className="flex items-center gap-1">
                    <QuantityControl 
                      onAdd={(quantity) => handleAddVersion(version, quantity)} 
                      compact={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [showVersions, versionsData, card.name, openModal, handleAddVersion]);

  // Grid view (versão compacta como no CardList original)
  if (viewMode === 'grid') {
    return (
      <div className="relative group" data-card-name={card.id}>
        <QuantityBadge card={card} collection={collection} />
        
        <div 
          className="cursor-pointer rounded-lg overflow-hidden flex flex-col border border-gray-700 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/20 transition-all"
          onClick={handleViewDetails}
        >
          {imageUrl && !imageError ? (
            <div className="aspect-[63/88] relative overflow-hidden bg-gray-900 flex items-center justify-center">
              {isLoading && (
                <div className="absolute inset-0 bg-gray-700 rounded animate-pulse flex items-center justify-center">
                  <div className="text-gray-400 text-xs">Carregando...</div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={card.name}
                fill
                className={`object-contain transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              />
            </div>
          ) : (
            <div className="aspect-[63/88] bg-gray-800 flex items-center justify-center text-center p-2">
              <span className="text-xs text-gray-400">{card.name}</span>
            </div>
          )}
          
          <div className="bg-gray-800 p-2 min-h-[80px] flex flex-col items-center justify-center gap-1">
            <div 
              className="opacity-0 group-hover:opacity-100 transition-opacity w-full" 
              onClick={(e) => e.stopPropagation()}
            >
              <QuantityControl onAdd={handleAddCard} compact={true} />
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                toggleVersions();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-400 hover:text-white h-5 px-1"
            >
              {showVersions ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Versões
            </Button>
          </div>
        </div>
        
        {renderVersionsPanel()}
      </div>
    );
  }

  // Details view (versão expandida com mais informações)
  if (viewMode === 'details') {
    return (
      <div data-card-name={card.id}>
        <Card className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <QuantityBadge card={card} collection={collection} />
              
              <div className="relative flex-shrink-0">
                {imageUrl && !imageError ? (
                  <div className="relative w-32 h-44">
                    {isLoading && (
                      <div className="absolute inset-0 bg-gray-700 rounded animate-pulse"></div>
                    )}
                    <Image
                      src={imageUrl}
                      alt={card.name}
                      fill
                      className={`object-cover rounded transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      sizes="128px"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-44 bg-gray-700 rounded flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <h3 className="text-white font-semibold text-lg">{card.name}</h3>
                  <p className="text-gray-400">{card.set_name}</p>
                  <p className="text-gray-500 text-sm">{card.type_line}</p>
                </div>
                
                {card.oracle_text && (
                  <div className="text-gray-300 text-sm">
                    <p className="font-medium text-gray-200 mb-1">Texto:</p>
                    <p className="italic">{card.oracle_text}</p>
                  </div>
                )}
                
                {(card.power || card.toughness) && (
                  <div className="text-gray-300 text-sm">
                    <span className="font-medium text-gray-200">P/T:</span> {card.power}/{card.toughness}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 items-end">
                <QuantityControl onAdd={handleAddCard} />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleViewDetails}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Info className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={toggleVersions}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    {showVersions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Seletor de Deck - apenas no modo detalhes */}
                <div className="w-full mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Adicionar a Deck</span>
                  </div>
                  <DeckSelector 
                    card={card}
                    className="w-full"
                    showCreateDeck={true}
                    showCategorySelect={true}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {renderVersionsPanel()}
      </div>
    );
  }

  // List view (versão horizontal compacta)
  return (
    <div data-card-name={card.id}>
      <Card 
        className="bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 transition-colors"
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <QuantityBadge card={card} collection={collection} />
            
            <div className="relative flex-shrink-0">
              {imageUrl && !imageError ? (
                <div className="relative w-16 h-20">
                  {isLoading && (
                    <div className="absolute inset-0 bg-gray-700 rounded animate-pulse"></div>
                  )}
                  <Image
                    src={imageUrl}
                    alt={card.name}
                    fill
                    className={`object-cover rounded transition-opacity ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="w-16 h-20 bg-gray-700 rounded flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium">{card.name}</h3>
              <p className="text-gray-400 text-sm">{card.set_name}</p>
              <p className="text-gray-500 text-xs">{card.type_line}</p>
            </div>

            <div className="flex items-center gap-2">
              <QuantityControl onAdd={handleAddCard} />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleViewDetails}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={toggleVersions}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                {showVersions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {renderVersionsPanel()}
    </div>
  );
});

SearchCardItem.displayName = 'SearchCardItem';

export default function SearchCardList({ cards, collection, onAddCard, className = '' }: SearchCardListProps) {
  const { visualizationType } = useCardModal();

  const containerClass = useMemo(() => {
    switch (visualizationType) {
      case 'grid':
        return `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 ${className}`;
      case 'details':
        return `space-y-6 ${className}`;
      default: // list
        return `space-y-3 ${className}`;
    }
  }, [visualizationType, className]);

  return (
    <div className={containerClass}>
      {cards.map((card) => (
        <SearchCardItem
          key={`search-card-item-${card.id}`}
          card={card}
          collection={collection}
          onAddCard={onAddCard}
          viewMode={visualizationType}
        />
      ))}
    </div>
  );
}
