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
import { User, Settings, LogOut, Crown, Star, Trophy } from "lucide-react"

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
          className="btn-modern-primary btn-modern-icon"
        >
          <User className="w-4 h-4" />
          Entrar
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
    <div className="flex items-center gap-lg">
      {/* Estatísticas rápidas */}
      <div className="hidden md:flex items-center gap-lg text-sm">
        <div className="flex items-center gap-xs" style={{ color: 'var(--color-accent-primary)' }}>
          <Trophy className="w-4 h-4" />
          <span>{user.collectionsCount || 0} coleções</span>
        </div>
        <div className="flex items-center gap-xs text-purple-400">
          <Star className="w-4 h-4" />
          <span>{user.totalCards || 0} cartas</span>
        </div>
      </div>

      {/* Menu do usuário */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-600/20">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback style={{ background: 'var(--color-accent-primary)', color: 'white' }}>
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-soft)', borderRadius: 'var(--radius-xl)' }} align="end">
          <DropdownMenuLabel style={{ color: 'var(--color-text-primary)' }}>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none" style={{ color: 'var(--color-text-quaternary)' }}>{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator style={{ background: 'var(--color-border-soft)' }} />
          
          {/* Estatísticas do usuário */}
          <div className="px-2 py-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 rounded" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <div className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{user.collectionsCount || 0}</div>
                <div style={{ color: 'var(--color-text-quaternary)' }}>Coleções</div>
              </div>
              <div className="text-center p-2 rounded" style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
                <div className="font-bold text-purple-400">{user.totalCards || 0}</div>
                <div style={{ color: 'var(--color-text-quaternary)' }}>Cartas</div>
              </div>
            </div>
          </div>

          {/* Conquistas recentes */}
          {user.achievements && user.achievements.length > 0 && (
            <>
              <DropdownMenuSeparator style={{ background: 'var(--color-border-soft)' }} />
              <div className="px-2 py-2">
                <div className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  <Crown className="w-3 h-3" />
                  Conquistas Recentes
                </div>
                {user.achievements.slice(0, 2).map((achievement, index) => (
                  <div key={index} className="text-xs py-1 px-2 rounded mb-1" style={{ color: 'var(--color-text-quaternary)', background: 'rgba(245, 158, 11, 0.1)' }}>
                    {achievement}
                  </div>
                ))}
              </div>
            </>
          )}

          <DropdownMenuSeparator style={{ background: 'var(--color-border-soft)' }} />
          
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-600/20" style={{ color: 'var(--color-text-tertiary)' }}>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-gray-600/20" style={{ color: 'var(--color-text-tertiary)' }}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator style={{ background: 'var(--color-border-soft)' }} />
          <DropdownMenuItem 
            className="cursor-pointer hover:bg-red-600/10"
            style={{ color: 'var(--color-accent-error)' }}
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
