"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Github, Chrome } from "lucide-react"

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

interface LoginDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onLogin: (user: User) => void
}

export default function LoginDialog({ isOpen, setIsOpen, onLogin }: LoginDialogProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Simular login (em produção, isso seria uma chamada de API)
    setTimeout(() => {
      if (loginData.email && loginData.password) {
        const mockUser: User = {
          id: '1',
          name: loginData.email.split('@')[0],
          email: loginData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loginData.email}`,
          joinedAt: new Date().toISOString(),
          collectionsCount: 3,
          totalCards: 1247,
          achievements: [
            'Primeiro Deck Criado',
            'Colecionador Iniciante',
            'Explorador de Cores'
          ]
        }
        onLogin(mockUser)
        setIsOpen(false)
        setLoginData({ email: '', password: '' })
      } else {
        setError('Por favor, preencha todos os campos')
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem')
      setIsLoading(false)
      return
    }

    // Simular registro
    setTimeout(() => {
      if (registerData.name && registerData.email && registerData.password) {
        const mockUser: User = {
          id: '1',
          name: registerData.name,
          email: registerData.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${registerData.email}`,
          joinedAt: new Date().toISOString(),
          collectionsCount: 0,
          totalCards: 0,
          achievements: ['Bem-vindo ao MTG Helper!']
        }
        onLogin(mockUser)
        setIsOpen(false)
        setRegisterData({ name: '', email: '', password: '', confirmPassword: '' })
      } else {
        setError('Por favor, preencha todos os campos')
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true)
    
    // Simular login social
    setTimeout(() => {
      const mockUser: User = {
        id: '1',
        name: `Usuário ${provider}`,
        email: `usuario@${provider}.com`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
        joinedAt: new Date().toISOString(),
        collectionsCount: 2,
        totalCards: 856,
        achievements: [
          'Login Social',
          'Colecionador Iniciante'
        ]
      }
      onLogin(mockUser)
      setIsOpen(false)
      setIsLoading(false)
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md rounded-lg text-card-foreground bg-gray-800/80 backdrop-blur-xl shadow-2xl overflow-hidden border-0">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-2xl">
            Entrar no MTG Helper
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Criar Conta</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 pr-10 bg-gray-800/50 border-gray-600/50 text-white"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button variant="link" className="text-blue-400 hover:text-blue-300 text-sm">
                Esqueceu sua senha?
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Nome
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={registerData.name}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-gray-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-gray-300">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-300">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10 bg-gray-800/50 border-gray-600/50 text-white"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Divisor */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-900 px-2 text-gray-400">Ou continue com</span>
          </div>
        </div>

        {/* Login Social */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('google')}
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin('github')}
            disabled={isLoading}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          Ao continuar, você concorda com nossos{' '}
          <Button variant="link" className="h-auto p-0 text-xs text-blue-400">
            Termos de Uso
          </Button>{' '}
          e{' '}
          <Button variant="link" className="h-auto p-0 text-xs text-blue-400">
            Política de Privacidade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
