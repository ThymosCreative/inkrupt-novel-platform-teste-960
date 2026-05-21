import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface AuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const { signIn, signUp } = useAuth()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleAuth = async (isLogin: boolean) => {
    if (!isLogin && password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }
    setLoading(true)
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password, name)
    setLoading(false)
    if (error) {
      toast.error(getErrorMessage(error))
    } else {
      toast.success(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!')
      onOpenChange(false)
    }
  }

  const handleSocialLogin = () => {
    toast.info('Login com Google será implementado em breve!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 p-0 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-3xl">
        <Tabs defaultValue="login" className="w-full">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-4 text-white">
                Bem-vindo à Inkrupt
              </DialogTitle>
            </DialogHeader>
            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 rounded-lg p-1">
              <TabsTrigger
                value="login"
                className="rounded-md data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-md data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
              >
                Cadastrar
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="login" className="p-6 pt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400 text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white">
                  Senha
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400 text-white"
              />
            </div>
            <Button
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
              onClick={() => handleAuth(true)}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : 'Entrar'}
            </Button>
          </TabsContent>

          <TabsContent value="register" className="p-6 pt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name" className="text-white">
                Nome
              </Label>
              <Input
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-white">
                Email
              </Label>
              <Input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-white">
                Senha
              </Label>
              <Input
                id="reg-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm" className="text-white">
                Confirmar Senha
              </Label>
              <Input
                id="reg-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400 text-white"
              />
            </div>
            <Button
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
              onClick={() => handleAuth(false)}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : 'Criar Conta'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="p-6 pt-0 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">Ou continue com</span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSocialLogin}
            className="w-full bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 h-10"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
