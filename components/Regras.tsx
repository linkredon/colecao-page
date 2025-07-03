"use client"

import '../styles/contrast-improvements.css'
import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  BookOpen, 
  Search, 
  Star, 
  Clock, 
  Users, 
  Zap,
  Shield,
  Target,
  Sword,
  Heart,
  Flame,
  AlertCircle, 
  ChevronDown, 
  ChevronRight,
  ExternalLink, 
  HelpCircle
} from 'lucide-react'
import { translatePtToEn } from '@/utils/translationService'

interface Rule {
  id: string
  title: string
  content: string
  category: string
  difficulty: 'Básico' | 'Intermediário' | 'Avançado'
  tags: string[]
  isFavorite?: boolean
}

export default function Regras() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)

  const categories = [
    { id: 'all', name: 'Todas', icon: BookOpen },
    { id: 'basic', name: 'Regras Básicas', icon: Star },
    { id: 'turn', name: 'Estrutura do Turno', icon: Clock },
    { id: 'combat', name: 'Combate', icon: Sword },
    { id: 'spell', name: 'Mágicas e Habilidades', icon: Zap },
    { id: 'permanent', name: 'Permanentes', icon: Shield },
    { id: 'zone', name: 'Zonas do Jogo', icon: Target },
    { id: 'multiplayer', name: 'Multiplayer', icon: Users }
  ]

  const rules: Rule[] = [
    {
      id: '1',
      title: 'Como Jogar Magic',
      content: `Magic: The Gathering é um jogo de cartas estratégico para dois ou mais jogadores. Cada jogador usa um deck personalizado de cartas Magic para derrotar seus oponentes.

**Objetivo do Jogo:**
Reduza os pontos de vida dos seus oponentes de 20 para 0, ou faça com que eles não possam comprar cartas do próprio deck.

**Componentes Básicos:**
- Deck de no mínimo 60 cartas
- Pontos de vida (começam com 20)
- Mana (recurso para jogar cartas)
- Cinco cores de mana: Branco, Azul, Preto, Vermelho e Verde`,
      category: 'basic',
      difficulty: 'Básico',
      tags: ['iniciante', 'conceitos', 'objetivo']
    },
    {
      id: '2',
      title: 'Estrutura do Turno',
      content: `Cada turno é dividido em fases específicas que devem ser seguidas em ordem:

**1. Fase Inicial (Beginning Phase):**
- Desvirar (Untap Step)
- Manutenção (Upkeep Step) 
- Compra (Draw Step)

**2. Fase Principal 1 (First Main Phase):**
- Jogue terrenos, mágicas e ative habilidades

**3. Fase de Combate (Combat Phase):**
- Declarar atacantes
- Declarar bloqueadores
- Resolver dano

**4. Fase Principal 2 (Second Main Phase):**
- Mesmas ações da Fase Principal 1

**5. Fase Final (Ending Phase):**
- Final do turno
- Limpeza`,
      category: 'turn',
      difficulty: 'Básico',
      tags: ['turno', 'fases', 'sequência']
    },
    {
      id: '3',
      title: 'Sistema de Mana',
      content: `Mana é o recurso usado para pagar o custo das mágicas. Existem cinco cores de mana:

**🤍 Branco (W):** 
- Proteção, cura, ordem
- Criaturas pequenas eficientes
- Remoção de ameaças

**🔵 Azul (U):**
- Compra de cartas, contramágicas
- Controle e manipulação
- Criaturas voadoras

**⚫ Preto (B):**
- Destruição, sacrifício
- Poder através de custos
- Criaturas com deathtouch

**🔴 Vermelho (R):**
- Dano direto, velocidade
- Emoção e caos
- Criaturas agressivas

**🟢 Verde (G):**
- Criaturas grandes, mana
- Natureza e crescimento
- Aceleração de mana`,
      category: 'basic',
      difficulty: 'Básico',
      tags: ['mana', 'cores', 'recursos']
    },
    {
      id: '4',
      title: 'Tipos de Cartas',
      content: `Existem vários tipos de cartas em Magic:

**Terrenos (Lands):**
- Produzem mana
- Podem ser jogados uma vez por turno
- Não custam mana para jogar

**Criaturas (Creatures):**
- Podem atacar e bloquear
- Têm poder e resistência
- Permanentes no campo de batalha

**Mágicas Instantâneas (Instants):**
- Podem ser jogadas a qualquer momento
- Vão para o cemitério após resolverem
- Efeitos imediatos

**Feitiços (Sorceries):**
- Só podem ser jogadas na sua fase principal
- Vão para o cemitério após resolverem
- Efeitos únicos

**Encantamentos (Enchantments):**
- Permanentes com efeitos contínuos
- Ficam no campo até serem removidos

**Artefatos (Artifacts):**
- Objetos mágicos
- Geralmente têm custos incolores
- Efeitos variados

**Planeswalkers:**
- Aliados poderosos
- Têm pontos de lealdade
- Habilidades ativáveis`,
      category: 'basic',
      difficulty: 'Intermediário',
      tags: ['tipos', 'cartas', 'permanentes']
    },
    {
      id: '5',
      title: 'Combate Detalhado',
      content: `O combate é dividido em várias etapas:

**1. Início do Combate:**
- Oportunidade para jogar mágicas
- Habilidades que ativam no início do combate

**2. Declarar Atacantes:**
- Escolha quais criaturas atacam
- Vire as criaturas atacantes
- Habilidades que ativam ao atacar

**3. Declarar Bloqueadores:**
- Defensor escolhe como bloquear
- Uma criatura pode bloquear um atacante
- Múltiplas criaturas podem bloquear um atacante

**4. Dano de Combate:**
- Criaturas aplicam dano igual ao poder
- Dano acontece simultaneamente
- Criaturas com deathtouch destroem com qualquer dano

**5. Final do Combate:**
- Últimas oportunidades para mágicas
- Habilidades de final de combate`,
      category: 'combat',
      difficulty: 'Intermediário',
      tags: ['combate', 'atacar', 'bloquear', 'dano']
    },
    {
      id: '6',
      title: 'A Pilha (Stack)',
      content: `A pilha é onde mágicas e habilidades esperam para resolver:

**Como Funciona:**
- Última mágica/habilidade a entrar é a primeira a resolver (LIFO)
- Jogadores podem responder adicionando mais à pilha
- Quando todos passam, o item do topo resolve

**Exemplo:**
1. Jogador A joga Lightning Bolt
2. Jogador B responde com Counterspell
3. Jogador A responde com Red Elemental Blast
4. Resolve: Red Elemental Blast → Counterspell → Lightning Bolt

**Dicas Importantes:**
- Mana permanece no pool durante resolução
- Você pode responder às suas próprias mágicas
- Algumas habilidades não usam a pilha (mana abilities)`,
      category: 'spell',
      difficulty: 'Avançado',
      tags: ['pilha', 'stack', 'resolução', 'resposta']
    }
  ]

  const quickRules = [
    { icon: Heart, title: 'Pontos de Vida', desc: 'Comece com 20, chegue a 0 e perde' },
    { icon: Clock, title: 'Limite de Mão', desc: 'Máximo de 7 cartas na mão' },
    { icon: Target, title: 'Terrenos por Turno', desc: 'Apenas 1 terreno por turno' },
    { icon: Zap, title: 'Velocidade da Mágica', desc: 'Instantâneas podem ser jogadas a qualquer momento' }
  ]

  const filteredRules = rules.filter(rule => {
    // Usar searchTerm e sua tradução para buscar
    const search = searchTerm.toLowerCase();
    const translatedSearch = translatePtToEn(search).toLowerCase();
    
    const matchesSearch = 
      rule.title.toLowerCase().includes(search) ||
      rule.content.toLowerCase().includes(search) ||
      rule.tags.some(tag => tag.toLowerCase().includes(search)) ||
      (translatedSearch !== search && (
        rule.title.toLowerCase().includes(translatedSearch) ||
        rule.content.toLowerCase().includes(translatedSearch) ||
        rule.tags.some(tag => tag.toLowerCase().includes(translatedSearch))
      ))
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFavorite = (ruleId: string) => {
    // Implementar favoritos
    console.log('Toggle favorite for rule:', ruleId)
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Regras do Magic
        </h1>
        <p className="text-gray-400">
          Aprenda as regras fundamentais do Magic: The Gathering
        </p>
      </div>

      <Tabs defaultValue="regras" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="regras">Regras</TabsTrigger>
          <TabsTrigger value="rapidas">Referência</TabsTrigger>
          <TabsTrigger value="glossario">Glossário</TabsTrigger>
        </TabsList>

        <TabsContent value="regras" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar com categorias */}
            <div className="lg:col-span-1 space-y-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar regras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-filter pl-10"
                />
              </div>

              {/* Categorias */}
              <Card className="rules-section">
                <CardHeader>
                  <CardTitle className="rules-title text-lg">Categorias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map(category => {
                    const Icon = category.icon
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className={`w-full justify-start rules-category ${
                          selectedCategory === category.id 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {category.name}
                      </Button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Lista de regras */}
            <div className="lg:col-span-3 space-y-4">
              {selectedRule ? (
                // Visualização detalhada da regra
                <Card className="rules-section">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRule(null)}
                          className="mb-2 interactive-element hover:bg-gray-700"
                        >
                          ← Voltar às regras
                        </Button>
                        <CardTitle className="rules-title text-2xl">{selectedRule.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            className={`${
                              selectedRule.difficulty === 'Básico' ? 'bg-green-700 text-green-100 border-green-600' :
                              selectedRule.difficulty === 'Intermediário' ? 'bg-yellow-700 text-yellow-100 border-yellow-600' : 
                              'bg-red-700 text-red-100 border-red-600'
                            }`}
                          >
                            {selectedRule.difficulty}
                          </Badge>
                          {selectedRule.tags.map(tag => (
                            <Badge key={tag} className="filter-tag text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(selectedRule.id)}
                        className="text-gray-400 hover:text-yellow-400"
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none">
                      <div className="rules-content whitespace-pre-wrap leading-relaxed">
                        {selectedRule.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Lista de regras
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      {filteredRules.length} regra{filteredRules.length !== 1 ? 's' : ''} encontrada{filteredRules.length !== 1 ? 's' : ''}
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    {filteredRules.map(rule => (
                      <Card 
                        key={rule.id} 
                        className="rules-section hover:bg-gray-700/50 cursor-pointer transition-all duration-200 border-l-4 border-l-blue-500"
                        onClick={() => setSelectedRule(rule)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="rules-title font-semibold mb-2">{rule.title}</h3>
                              <p className="rules-content text-sm line-clamp-2 mb-3">
                                {rule.content.substring(0, 150)}...
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  className={`${
                                    rule.difficulty === 'Básico' ? 'bg-green-700 text-green-100 border-green-600' :
                                    rule.difficulty === 'Intermediário' ? 'bg-yellow-700 text-yellow-100 border-yellow-600' : 
                                    'bg-red-700 text-red-100 border-red-600'
                                  }`}
                                >
                                  {rule.difficulty}
                                </Badge>
                                {rule.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} className="filter-tag text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFavorite(rule.id)
                                }}
                                className="text-gray-400 hover:text-yellow-400"
                              >
                                <Star className="w-4 h-4" />
                              </Button>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rapidas" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickRules.map((rule, index) => {
              const Icon = rule.icon
              return (
                <Card key={index} className="rules-section hover:bg-gray-700/30 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="rules-title font-semibold mb-2">{rule.title}</h3>
                    <p className="text-gray-400 text-sm">{rule.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Referência Rápida das Cores */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Cores de Mana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { color: 'Branco', symbol: 'W', bg: 'bg-yellow-100', theme: 'Ordem, proteção, cura' },
                  { color: 'Azul', symbol: 'U', bg: 'bg-blue-500', theme: 'Conhecimento, controle, magia' },
                  { color: 'Preto', symbol: 'B', bg: 'bg-gray-800', theme: 'Poder, ambição, sacrifício' },
                  { color: 'Vermelho', symbol: 'R', bg: 'bg-red-500', theme: 'Emoção, liberdade, caos' },
                  { color: 'Verde', symbol: 'G', bg: 'bg-green-500', theme: 'Natureza, crescimento, vida' }
                ].map(color => (
                  <div key={color.symbol} className="text-center">
                    <div className={`w-16 h-16 ${color.bg} rounded-full flex items-center justify-center mx-auto mb-2 text-white font-bold text-xl`}>
                      {color.symbol}
                    </div>
                    <h4 className="font-semibold text-white">{color.color}</h4>
                    <p className="text-gray-400 text-xs mt-1">{color.theme}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="glossario" className="space-y-6">
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white">Glossário de Termos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { term: 'CMC (Custo de Mana Convertido)', def: 'O custo total de mana necessário para jogar uma mágica' },
                  { term: 'Deathtouch', def: 'Qualquer quantidade de dano desta criatura destrói uma criatura' },
                  { term: 'Flying (Voar)', def: 'Esta criatura só pode ser bloqueada por criaturas com flying ou reach' },
                  { term: 'Haste (Ímpeto)', def: 'Esta criatura pode atacar no turno que entra em jogo' },
                  { term: 'Lifelink', def: 'O dano causado por esta criatura também ganha pontos de vida' },
                  { term: 'Reach (Alcance)', def: 'Esta criatura pode bloquear criaturas com flying' },
                  { term: 'Trample (Atropelar)', def: 'Dano excessivo no combate pode ser aplicado ao defensor' },
                  { term: 'Vigilance (Vigilância)', def: 'Atacar não faz esta criatura virar' }
                ].map((item, index) => (
                  <div key={index} className="border-b border-gray-700/50 last:border-b-0 pb-3 last:pb-0">
                    <h4 className="font-semibold text-white mb-1">{item.term}</h4>
                    <p className="text-gray-400 text-sm">{item.def}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Links Úteis */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">Links Úteis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-4 h-4" />
                <span className="font-semibold">Regras Oficiais</span>
              </div>
              <span className="text-xs text-gray-400">Comprehensive Rules completas</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-4 h-4" />
                <span className="font-semibold">Judge Chat</span>
              </div>
              <span className="text-xs text-gray-400">Tire dúvidas com juízes</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4" />
                <span className="font-semibold">Gatherer</span>
              </div>
              <span className="text-xs text-gray-400">Base de dados oficial de cartas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
