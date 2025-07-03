"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Star, 
  Target,
  Trophy,
  Zap,
  Users,
  Award,
  Clock,
  DollarSign,
  PieChart
} from "lucide-react"

export default function Painel() {
  const [stats, setStats] = useState({
    totalCards: 1247,
    uniqueCards: 892,
    totalDecks: 8,
    favoriteColors: ['Azul', 'Preto'],
    recentActivity: 15,
    collectionValue: 1850.75,
    weeklyGoal: 65,
    weeklyProgress: 42
  })

  const [achievements] = useState([
    { name: "Colecionador Iniciante", description: "Possua 100 cartas únicas", progress: 100, icon: Star },
    { name: "Construtor de Decks", description: "Crie 5 decks diferentes", progress: 80, icon: Target },
    { name: "Explorador de Cores", description: "Tenha cartas de todas as 5 cores", progress: 100, icon: Trophy },
    { name: "Veterano MTG", description: "Possua cartas de 10 expansões diferentes", progress: 75, icon: Award }
  ])

  const [recentCards] = useState([
    { name: "Lightning Bolt", set: "2XM", rarity: "common", addedAt: "Há 2 horas" },
    { name: "Counterspell", set: "TSR", rarity: "common", addedAt: "Há 5 horas" },
    { name: "Serra Angel", set: "M21", rarity: "uncommon", addedAt: "Ontem" },
    { name: "Black Lotus", set: "LEA", rarity: "rare", addedAt: "2 dias atrás" }
  ])

  return (
    <div className="container space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-2xl">
        <h1 className="text-heading-1 mb-md">
          Painel de Controle
        </h1>
        <p className="text-body opacity-80">
          Visão geral da sua coleção e atividades recentes
        </p>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-2xl">
        <div className="card-modern">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption mb-sm">Total de Cartas</p>
                <p className="text-heading-3" style={{ color: 'var(--color-accent-primary)' }}>{stats.totalCards.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                <BarChart3 className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card-modern">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption mb-sm">Cartas Únicas</p>
                <p className="text-heading-3" style={{ color: '#8b5cf6' }}>{stats.uniqueCards.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <Star className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="card-modern">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption mb-sm">Decks Criados</p>
                <p className="text-heading-3" style={{ color: 'var(--color-accent-success)' }}>{stats.totalDecks}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-between" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <Target className="w-6 h-6" style={{ color: 'var(--color-accent-success)' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card-modern">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption mb-sm">Valor Estimado</p>
                <p className="text-heading-3" style={{ color: 'var(--color-accent-warning)' }}>R$ {stats.collectionValue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                <DollarSign className="w-6 h-6" style={{ color: 'var(--color-accent-warning)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
        {/* Meta Semanal */}
        <div className="card-modern">
          <div className="card-header">
            <h3 className="text-heading-4 flex items-center gap-sm">
              <Zap className="w-5 h-5" style={{ color: 'var(--color-accent-warning)' }} />
              Meta Semanal
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-body-sm">Progresso</span>
                <span className="text-body">{stats.weeklyProgress}/{stats.weeklyGoal} cartas</span>
              </div>
              <Progress value={(stats.weeklyProgress / stats.weeklyGoal) * 100} className="h-2" />
              <p className="text-caption opacity-80">
                {stats.weeklyGoal - stats.weeklyProgress} cartas restantes para atingir a meta
              </p>
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <div className="card-modern">
          <div className="card-header">
            <h3 className="text-heading-4 flex items-center gap-sm">
              <Trophy className="w-5 h-5" style={{ color: 'var(--color-accent-warning)' }} />
              Conquistas Recentes
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {achievements.slice(0, 3).map((achievement, index) => {
                const Icon = achievement.icon
                return (
                  <div key={index} className="flex items-center gap-md">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                      <Icon className="w-4 h-4" style={{ color: 'var(--color-accent-warning)' }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-body-sm font-medium mb-sm">{achievement.name}</p>
                      <div className="flex items-center gap-md">
                        <Progress value={achievement.progress} className="h-1 flex-1" />
                        <span className="text-caption">{achievement.progress}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
        {/* Cartas Adicionadas Recentemente */}
        <div className="lg:col-span-2 card-modern">
          <div className="card-header">
            <h3 className="text-heading-4 flex items-center gap-sm">
              <Clock className="w-5 h-5" style={{ color: 'var(--color-accent-primary)' }} />
              Cartas Adicionadas Recentemente
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {recentCards.map((card, index) => (
                <div key={index} className="flex items-center justify-between p-md rounded-lg transition-all duration-200 hover:bg-gray-600/20" style={{ border: '1px solid var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-md">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-soft)' }}>
                      <span className="text-caption font-bold">MTG</span>
                    </div>
                    <div>
                      <p className="text-body font-medium mb-xs">{card.name}</p>
                      <div className="flex items-center gap-sm">
                        <Badge variant="outline" className="text-xs" style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-soft)' }}>
                          {card.set}
                        </Badge>
                        <Badge 
                          variant={card.rarity === 'rare' ? 'default' : 'secondary'} 
                          className={`text-xs ${
                            card.rarity === 'common' ? 'rarity-common' :
                            card.rarity === 'uncommon' ? 'rarity-uncommon' :
                            card.rarity === 'rare' ? 'rarity-rare' :
                            'rarity-mythic'
                          }`}
                        >
                          {card.rarity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-caption">{card.addedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cores Favoritas */}
        <div className="card-modern">
          <div className="card-header">
            <h3 className="text-heading-4 flex items-center gap-sm">
              <PieChart className="w-5 h-5 text-purple-400" />
              Distribuição por Cores
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {[
                { color: 'Azul', percentage: 28, bgColor: 'bg-blue-500' },
                { color: 'Preto', percentage: 24, bgColor: 'bg-gray-900' },
                { color: 'Vermelho', percentage: 20, bgColor: 'bg-red-500' },
                { color: 'Verde', percentage: 16, bgColor: 'bg-green-500' },
                { color: 'Branco', percentage: 12, bgColor: 'bg-gray-100' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-md">
                  <div className={`w-3 h-3 rounded-full ${item.bgColor}`}></div>
                  <span className="text-body-sm flex-1">{item.color}</span>
                  <span className="text-body font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="card-modern">
        <div className="card-header">
          <h3 className="text-heading-4">Ações Rápidas</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <button className="btn-modern-ghost btn-modern-icon h-20 flex flex-col gap-sm">
              <BarChart3 className="w-6 h-6" />
              <span className="text-caption">Relatórios</span>
            </button>
            <button className="btn-modern-ghost btn-modern-icon h-20 flex flex-col gap-sm">
              <Users className="w-6 h-6" />
              <span className="text-caption">Comunidade</span>
            </button>
            <button className="btn-modern-ghost btn-modern-icon h-20 flex flex-col gap-sm">
              <TrendingUp className="w-6 h-6" />
              <span className="text-caption">Análises</span>
            </button>
            <button className="btn-modern-ghost btn-modern-icon h-20 flex flex-col gap-sm">
              <Calendar className="w-6 h-6" />
              <span className="text-caption">Eventos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
