"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import LoginDialog from './LoginDialog'
import { 
  User, 
  Settings, 
  LogOut, 
  Crown, 
  Star, 
  Trophy, 
  Shield,
  Zap,
  Bell,
  ChevronDown,
  Users,
  BarChart3
} from "lucide-react"

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

interface UserHeaderProps {
  user: User | null
  onLogin: (user: User) => void
  onLogout: () => void
}

export default function UserHeader({ user, onLogin, onLogout }: UserHeaderProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Se o usuário não existe, mostrar botão de login
  if (!user) {
    return (
      <>
        <button 
          onClick={() => setIsLoginOpen(true)}
          className="mtg-button mtg-button-primary"
        >
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Entrar</span>
        </button>

        <LoginDialog 
          isOpen={isLoginOpen} 
          setIsOpen={setIsLoginOpen}
          onLogin={onLogin}
        />
      </>
    )
  }

  // Se o usuário existe, mostrar interface do usuário logado
  return (
    <div className="flex items-center gap-3 lg:gap-6">
      {/* Status Indicators - Hidden on mobile */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-blue-400" />
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{user.collectionsCount || 0}</div>
              <div className="text-xs text-slate-400">coleções</div>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-purple-400" />
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{user.totalCards || 0}</div>
              <div className="text-xs text-slate-400">cartas</div>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center">
            <Bell className="w-4 h-4 text-slate-400" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-center">
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="mtg-user-trigger"
          >
            <Avatar className="w-10 h-10 ring-2 ring-slate-700">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-white">{user.name}</div>
              <div className="text-xs text-slate-400">Online</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="mtg-dropdown mtg-user-menu" 
          align="end"
          sideOffset={8}
        >
          {/* User Profile Header */}
          <DropdownMenuLabel className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-2 ring-blue-500/30">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-base">{user.name}</h3>
                <p className="text-sm text-slate-400 truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="mtg-status mtg-status-success">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Online
                  </div>
                  <div className="mtg-badge mtg-badge-primary text-xs">PRO</div>
                </div>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          {/* User Stats */}
          <div className="px-2 py-4">
            <div className="mtg-grid-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold text-blue-400">{user.collectionsCount || 0}</div>
                <div className="text-xs text-slate-400">Coleções</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-xl font-bold text-purple-400">{user.totalCards || 0}</div>
                <div className="text-xs text-slate-400">Cartas</div>
              </div>
            </div>
          </div>

          {/* Recent Achievements */}
          {user.achievements && user.achievements.length > 0 && (
            <>
              <DropdownMenuSeparator className="bg-slate-700" />
              <div className="px-2 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="font-medium text-slate-200">Conquistas Recentes</span>
                </div>
                <div className="space-y-2">
                  {user.achievements.slice(0, 2).map((achievement, index) => (
                    <div key={index} className="mtg-achievement-compact">
                      <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="text-sm text-slate-300 flex-1 font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <DropdownMenuSeparator className="bg-slate-700" />
          
          {/* Menu Items */}
          <div className="py-2">
            <DropdownMenuItem className="mtg-dropdown-item">
              <User className="w-4 h-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="mtg-dropdown-item">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="mtg-dropdown-item">
              <Users className="w-4 h-4" />
              <span>Comunidade</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="mtg-dropdown-item">
              <Settings className="w-4 h-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
          </div>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <div className="py-2">
            <DropdownMenuItem 
              className="mtg-dropdown-item text-red-400 hover:bg-red-500/20 focus:bg-red-500/20"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
