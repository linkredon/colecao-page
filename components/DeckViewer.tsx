"use client"

import React, { useState, useMemo } from 'react';
import '../styles/moxfield.css';
import { useAppContext } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { translatePtToEn, cardMatchesSearchTerm } from '@/utils/translationService';
import { getImageUrl } from '@/utils/imageService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCardModal } from '@/contexts/CardModalContext';
import { 
  ArrowLeft, Edit3, Save, X, Plus, Minus, Eye, Copy, 
  Download, Settings, Trash2, Package, Target,
  Grid3X3, List, Search, Filter,
  PieChart, BarChart3, FileText
} from 'lucide-react';
import Image from 'next/image';
import type { MTGCard } from '@/types/mtg';

interface DeckViewerProps {
  deckId: string;
  onClose: () => void;
  onEdit?: () => void;
}

const DeckViewer: React.FC<DeckViewerProps> = ({ deckId, onClose, onEdit }) => {
  const { decks, editarDeck, deletarDeck, duplicarDeck, atualizarQuantidadeNoDeck, removerCartaDoDeck } = useAppContext();
  const { openModal } = useCardModal();
  
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'spoiler'>('grid');
  const [filterCategory, setFilterCategory] = useState<'all' | 'mainboard' | 'sideboard' | 'commander'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const deck = decks.find(d => d.id === deckId);
  
  const [editedDeck, setEditedDeck] = useState({
    name: deck?.name || '',
    format: deck?.format || 'Standard',
    description: deck?.description || '',
    colors: deck?.colors || [],
    tags: deck?.tags || []
  });

  if (!deck) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Deck não encontrado</p>
      </div>
    );
  }

  // Filtrar cartas
  const filteredCards = useMemo(() => {
    let filtered = deck.cards;
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(card => card.category === filterCategory);
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(card => cardMatchesSearchTerm(card.card, searchTerm));
    }
    
    return filtered;
  }, [deck.cards, filterCategory, searchTerm]);

  // Estatísticas do deck
  const stats = useMemo(() => {
    const mainboard = deck.cards.filter(c => c.category === 'mainboard');
    const sideboard = deck.cards.filter(c => c.category === 'sideboard');
    const commander = deck.cards.filter(c => c.category === 'commander');
    
    const mainboardCount = mainboard.reduce((sum, c) => sum + c.quantity, 0);
    const sideboardCount = sideboard.reduce((sum, c) => sum + c.quantity, 0);
    const commanderCount = commander.reduce((sum, c) => sum + c.quantity, 0);
    
    const manaCurve: Record<number, number> = {};
    mainboard.forEach(card => {
      const cmc = card.card.cmc || 0;
      const cmcKey = cmc >= 7 ? 7 : cmc;
      manaCurve[cmcKey] = (manaCurve[cmcKey] || 0) + card.quantity;
    });
    
    return {
      mainboard: mainboardCount,
      sideboard: sideboardCount,
      commander: commanderCount,
      total: mainboardCount + sideboardCount + commanderCount,
      unique: deck.cards.length,
      manaCurve
    };
  }, [deck.cards]);

  const handleSave = () => {
    editarDeck(deckId, {
      name: editedDeck.name,
      format: editedDeck.format,
      description: editedDeck.description,
      colors: editedDeck.colors,
      tags: editedDeck.tags
    });
    setEditMode(false);
  };

  const handleDelete = () => {
    deletarDeck(deckId);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleDuplicate = () => {
    duplicarDeck(deckId, `${deck.name} (Cópia)`);
  };

  const handleUpdateQuantity = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander', newQuantity: number) => {
    atualizarQuantidadeNoDeck(deckId, cardId, newQuantity, category);
  };

  const handleRemoveCard = (cardId: string, category: 'mainboard' | 'sideboard' | 'commander') => {
    removerCartaDoDeck(deckId, cardId, category);
  };

  const exportDeckList = () => {
    const mainboard = deck.cards.filter(c => c.category === 'mainboard');
    const sideboard = deck.cards.filter(c => c.category === 'sideboard');
    const commander = deck.cards.filter(c => c.category === 'commander');
    
    let exportText = `// ${deck.name}\n// Formato: ${deck.format}\n\n`;
    
    if (commander.length > 0) {
      exportText += "Commander:\n";
      commander.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card.name}\n`;
      });
      exportText += "\n";
    }
    
    if (mainboard.length > 0) {
      exportText += "Main Deck:\n";
      mainboard.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card.name}\n`;
      });
      exportText += "\n";
    }
    
    if (sideboard.length > 0) {
      exportText += "Sideboard:\n";
      sideboard.forEach(deckCard => {
        exportText += `${deckCard.quantity} ${deckCard.card.name}\n`;
      });
    }
    
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-[calc(100vh-80px)]">
      {/* Header estilo Moxfield */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  {deck.name}
                  <Badge className="ml-2 bg-indigo-700 hover:bg-indigo-600 text-white">{deck.format}</Badge>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {deck.colors.length > 0 && (
                    <div className="flex gap-1">
                      {deck.colors.map(color => (
                        <div 
                          key={color}
                          className={`w-5 h-5 rounded-full mana-symbol mana-${color.toLowerCase()} shadow-sm`}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                  <span className="text-gray-400 text-sm">
                    {stats.total} cartas • {stats.unique} únicas
                  </span>
                  {deck.description && (
                    <span className="text-gray-500 text-sm hidden md:inline">
                      • {deck.description.substring(0, 50)}{deck.description.length > 50 ? "..." : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <Button variant="outline" size="sm" onClick={exportDeckList} className="border-[#3a3a42] text-gray-300 hover:bg-[#2b2b33]/80 h-8">
                <Download className="w-3 h-3 mr-1" />
                Exportar
              </Button>
              
              <Button variant="outline" size="sm" onClick={handleDuplicate} className="border-[#3a3a42] text-gray-300 hover:bg-[#2b2b33]/80 h-8">
                <Copy className="w-3 h-3 mr-1" />
                Duplicar
              </Button>
              
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="border-indigo-700/50 text-indigo-400 hover:bg-indigo-700/10 h-8">
                <Edit3 className="w-3 h-3 mr-1" />
                Editar
              </Button>
              
              <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-red-700/50 text-red-400 hover:bg-red-700/10 h-8">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0">
                  <DialogHeader>
                    <DialogTitle className="text-white">Deletar Deck</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Tem certeza que deseja deletar o deck "{deck.name}"? Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="border-[#3a3a42] text-gray-300 hover:bg-[#2b2b33]">
                        Cancelar
                      </Button>
                      <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        Deletar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Navegação secundária */}
          <div className="flex flex-wrap items-center gap-2 mt-3 border-t border-[#2b2b30] pt-3">
            <Button variant="ghost" size="sm" className="h-8 text-sm text-gray-300 hover:text-white hover:bg-[#2b2b33] bg-[#2b2b33]/50">
              <Eye className="w-3 h-3 mr-1" />
              Visualizar
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-sm text-gray-300 hover:text-white hover:bg-[#2b2b33]">
              <PieChart className="w-3 h-3 mr-1" />
              Estatísticas
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-sm text-gray-300 hover:text-white hover:bg-[#2b2b33]">
              <Settings className="w-3 h-3 mr-1" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Deck</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Deck</label>
                <Input
                  value={editedDeck.name}
                  onChange={(e) => setEditedDeck(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Formato</label>
                <Select value={editedDeck.format} onValueChange={(value) => setEditedDeck(prev => ({ ...prev, format: value }))}>
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
                value={editedDeck.description}
                onChange={(e) => setEditedDeck(prev => ({ ...prev, description: e.target.value }))}
                className="bg-gray-700/50 border-gray-600 text-white"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Layout principal - 3 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 px-4 pb-8">
        {/* Coluna esquerda - Lista de cartas */}
        <div className="lg:col-span-3 space-y-4" style={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm pb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cartas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white h-9 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 px-2 border-gray-700 bg-gray-800">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge 
                variant={filterCategory === 'all' ? 'default' : 'outline'} 
                className="bg-gray-700 hover:bg-gray-600 border-0 text-xs cursor-pointer"
                onClick={() => setFilterCategory('all')}
              >
                Todas
              </Badge>
              <Badge 
                variant={filterCategory === 'mainboard' ? 'default' : 'outline'} 
                className="bg-blue-800/50 hover:bg-blue-700/60 text-blue-200 border-blue-700/50 text-xs cursor-pointer"
                onClick={() => setFilterCategory('mainboard')}
              >
                Principal
              </Badge>
              {deck.cards.filter(c => c.category === 'commander').length > 0 && (
                <Badge 
                  variant={filterCategory === 'commander' ? 'default' : 'outline'} 
                  className="bg-amber-800/50 hover:bg-amber-700/60 text-amber-200 border-amber-700/50 text-xs cursor-pointer"
                  onClick={() => setFilterCategory('commander')}
                >
                  Commander
                </Badge>
              )}
              {deck.cards.filter(c => c.category === 'sideboard').length > 0 && (
                <Badge 
                  variant={filterCategory === 'sideboard' ? 'default' : 'outline'} 
                  className="bg-green-800/50 hover:bg-green-700/60 text-green-200 border-green-700/50 text-xs cursor-pointer"
                  onClick={() => setFilterCategory('sideboard')}
                >
                  Sideboard
                </Badge>
              )}
            </div>
          </div>
          
          <DeckCardsList 
            cards={filteredCards} 
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveCard={handleRemoveCard}
            onCardClick={openModal}
          />
        </div>

        {/* Coluna central - Visualização */}
        <div className="lg:col-span-6" style={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
          <Card className="bg-gray-800/40 border border-gray-700 shadow-md">
            <CardHeader className="p-3 border-b border-gray-700 bg-gray-800/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-gray-200 text-base">Visualização</CardTitle>
                  <Badge variant="outline" className="text-xs bg-gray-700/50 border-gray-600 ml-2">
                    {filteredCards.reduce((sum, c) => sum + c.quantity, 0)} cartas
                  </Badge>
                </div>
                <div className="flex items-center gap-1 bg-gray-700/60 rounded-md p-1">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="h-7 w-7 p-0"
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'spoiler' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('spoiler')}
                    className="h-7 w-7 p-0"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <VisualCardDisplay
                cards={filteredCards}
                viewMode={viewMode}
                onCardClick={openModal}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita - Estatísticas */}
        <div className="lg:col-span-3 space-y-4" style={{ maxHeight: 'calc(100vh - 180px)', overflow: 'auto' }}>
          <Card className="bg-gray-800/40 border border-gray-700 shadow-md">
            <CardHeader className="p-3 border-b border-gray-700 bg-gray-800/70">
              <CardTitle className="text-gray-200 text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Contagens
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-700/40 p-2 rounded-md text-center">
                  <div className="text-blue-400 font-bold text-lg">{stats.mainboard}</div>
                  <div className="text-gray-400 text-xs">Principal</div>
                </div>
                {stats.sideboard > 0 && (
                  <div className="bg-gray-700/40 p-2 rounded-md text-center">
                    <div className="text-green-400 font-bold text-lg">{stats.sideboard}</div>
                    <div className="text-gray-400 text-xs">Sideboard</div>
                  </div>
                )}
                {stats.commander > 0 && (
                  <div className="bg-gray-700/40 p-2 rounded-md text-center">
                    <div className="text-yellow-400 font-bold text-lg">{stats.commander}</div>
                    <div className="text-gray-400 text-xs">Commander</div>
                  </div>
                )}
                <div className="bg-gray-700/40 p-2 rounded-md text-center">
                  <div className="text-white font-bold text-lg">{stats.total}</div>
                  <div className="text-gray-400 text-xs">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ManaCurveDisplay manaCurve={stats.manaCurve} />
          <TypeDistributionDisplay cards={deck.cards.filter(c => c.category === 'mainboard')} />

          {deck.description && (
            <Card className="bg-gray-800/40 border border-gray-700 shadow-md">
              <CardHeader className="p-3 border-b border-gray-700 bg-gray-800/70">
                <CardTitle className="text-gray-200 text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descrição
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{deck.description}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para lista de cartas
const DeckCardsList: React.FC<{
  cards: any[];
  onUpdateQuantity: (cardId: string, category: any, newQuantity: number) => void;
  onRemoveCard: (cardId: string, category: any) => void;
  onCardClick: (card: MTGCard) => void;
}> = ({ cards, onUpdateQuantity, onRemoveCard, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-8 h-8 mx-auto mb-2 text-gray-500" />
        <p className="text-gray-400 text-sm">Nenhuma carta encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cards.map((deckCard) => (
        <div 
          key={`${deckCard.card.id}-${deckCard.category}`}
          className="flex items-center p-2 bg-gray-800/40 rounded border border-gray-700 hover:bg-gray-700/40 transition-colors group"
        >
          <div className="w-8 h-11 bg-gray-900 rounded overflow-hidden flex-shrink-0 mr-3">
            {getImageUrl(deckCard.card, 'small') ? (
              <Image
                src={getImageUrl(deckCard.card, 'small')}
                alt={deckCard.card.name}
                width={32}
                height={44}
                className="object-cover cursor-pointer"
                onClick={() => onCardClick(deckCard.card)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                {deckCard.card.set_code}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div 
              className="text-sm text-gray-200 font-medium truncate cursor-pointer hover:text-blue-400" 
              onClick={() => onCardClick(deckCard.card)}
            >
              {deckCard.card.name}
            </div>
            <div className="text-xs text-gray-400">{deckCard.card.type_line}</div>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-300 w-6 text-center">{deckCard.quantity}</span>
            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity - 1)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdateQuantity(deckCard.card.id, deckCard.category, deckCard.quantity + 1)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveCard(deckCard.card.id, deckCard.category)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para visualização das cartas
const VisualCardDisplay: React.FC<{
  cards: any[];
  viewMode: 'grid' | 'spoiler';
  onCardClick: (card: MTGCard) => void;
}> = ({ cards, viewMode, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-70" />
        <p className="text-gray-400 text-sm">Nenhuma carta para exibir</p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {cards.map((deckCard) => (
          <div key={`${deckCard.card.id}-${deckCard.category}`} className="relative group">
            <div className="aspect-[63/88] bg-gray-800/80 rounded-md overflow-hidden shadow-md">
              {getImageUrl(deckCard.card) ? (
                <Image
                  src={getImageUrl(deckCard.card)}
                  alt={deckCard.card.name}
                  fill
                  className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => onCardClick(deckCard.card)}
                  sizes="120px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
                  {deckCard.card.name}
                </div>
              )}
              
              <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-md">
                {deckCard.quantity}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium truncate">{deckCard.card.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((deckCard) => (
        <div 
          key={`${deckCard.card.id}-${deckCard.category}`} 
          className="flex gap-3 p-3 bg-gray-800/40 rounded border border-gray-700 hover:bg-gray-700/40 transition-colors"
        >
          <div className="w-16 h-22 bg-gray-800 rounded overflow-hidden flex-shrink-0">
            {getImageUrl(deckCard.card, 'normal') ? (
              <Image
                src={getImageUrl(deckCard.card, 'normal')}
                alt={deckCard.card.name}
                width={64}
                height={88}
                className="object-cover cursor-pointer"
                onClick={() => onCardClick(deckCard.card)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1">
                {deckCard.card.name}
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-gray-100 font-bold cursor-pointer hover:text-blue-400" onClick={() => onCardClick(deckCard.card)}>
                {deckCard.card.name}
              </h3>
              <Badge className="bg-blue-600/30 text-blue-200 border-0 text-xs">
                {deckCard.quantity}x
              </Badge>
            </div>
            
            <p className="text-gray-300 text-sm">{deckCard.card.type_line}</p>
            <p className="text-gray-400 text-xs">{deckCard.card.set_name}</p>
            
            {deckCard.card.oracle_text && (
              <div className="mt-2 p-2 bg-gray-800/70 rounded text-gray-300 text-xs">
                {deckCard.card.oracle_text.substring(0, 200)}
                {deckCard.card.oracle_text.length > 200 && '...'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para curva de mana
const ManaCurveDisplay: React.FC<{ manaCurve: Record<number, number> }> = ({ manaCurve }) => {
  const maxCount = Math.max(...Object.values(manaCurve), 1);
  const totalCards = Object.values(manaCurve).reduce((sum, count) => sum + count, 0);
  
  return (
    <Card className="bg-gray-800/40 border border-gray-700 shadow-md">
      <CardHeader className="p-3 border-b border-gray-700 bg-gray-800/70">
        <CardTitle className="text-gray-200 text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Curva de Mana
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex items-end justify-between gap-1 h-20">
          {[0, 1, 2, 3, 4, 5, 6, 7].map(cmc => {
            const count = manaCurve[cmc] || 0;
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            
            return (
              <div key={cmc} className="flex flex-col items-center flex-1">
                <div className="text-xs text-gray-400 mb-1 h-3">
                  {count > 0 && count}
                </div>
                <div className="w-full bg-gray-700/50 rounded-t relative" style={{ height: '50px' }}>
                  <div 
                    className="absolute bottom-0 w-full bg-blue-600/70 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {cmc === 7 ? '7+' : cmc}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-2 text-center">
          <div className="text-xs text-gray-400">
            Média: {totalCards > 0 ? (
              Object.entries(manaCurve).reduce((sum, [cmc, count]) => sum + (Number(cmc) * count), 0) / totalCards
            ).toFixed(1) : '0.0'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para distribuição de tipos
const TypeDistributionDisplay: React.FC<{ cards: any[] }> = ({ cards }) => {
  const typeDistribution = useMemo(() => {
    const types: Record<string, number> = {};
    
    cards.forEach((deckCard) => {
      const typeLine = deckCard.card.type_line?.toLowerCase() || '';
      let mainType = 'Other';
      
      if (typeLine.includes('creature')) mainType = 'Creature';
      else if (typeLine.includes('instant')) mainType = 'Instant';
      else if (typeLine.includes('sorcery')) mainType = 'Sorcery';
      else if (typeLine.includes('artifact')) mainType = 'Artifact';
      else if (typeLine.includes('enchantment')) mainType = 'Enchantment';
      else if (typeLine.includes('planeswalker')) mainType = 'Planeswalker';
      else if (typeLine.includes('land')) mainType = 'Land';
      
      types[mainType] = (types[mainType] || 0) + deckCard.quantity;
    });
    
    return Object.entries(types).sort(([,a], [,b]) => b - a);
  }, [cards]);

  const total = typeDistribution.reduce((sum, [, count]) => sum + count, 0);
  
  const typeColors: Record<string, string> = {
    'Creature': 'bg-green-600/70',
    'Instant': 'bg-blue-600/70',
    'Sorcery': 'bg-red-600/70',
    'Artifact': 'bg-slate-400/70',
    'Enchantment': 'bg-yellow-600/70',
    'Planeswalker': 'bg-purple-600/70',
    'Land': 'bg-emerald-700/70',
    'Other': 'bg-gray-500/70'
  };

  if (typeDistribution.length === 0) return null;

  return (
    <Card className="bg-gray-800/40 border border-gray-700 shadow-md">
      <CardHeader className="p-3 border-b border-gray-700 bg-gray-800/70">
        <CardTitle className="text-gray-200 text-base flex items-center gap-2">
          <PieChart className="w-4 h-4" />
          Tipos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {typeDistribution.map(([type, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={type} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-sm ${typeColors[type]}`}></div>
                <span className="text-gray-300">{type}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-700/70 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${typeColors[type]} rounded-full`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-gray-400 text-xs w-6 text-right">{count}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default DeckViewer;
