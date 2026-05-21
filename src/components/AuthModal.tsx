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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (isLogin: boolean) => {
    setLoading(true)
    const { error } = isLogin ? await signIn(email, password) : await signUp(email, password)
    setLoading(false)
    if (error) {
      toast.error(getErrorMessage(error))
    } else {
      toast.success(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!')
      onOpenChange(false)
    }
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
            <Button
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
              onClick={() => handleAuth(false)}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : 'Criar Conta'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
