import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Github } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] bg-zinc-950 border-zinc-800 p-0 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-3xl">
        <Tabs defaultValue="login" className="w-full">
          <div className="p-6 pb-2">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center mb-4">
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a href="#" className="text-xs text-lime-400 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400"
              />
            </div>
            <Button
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
              onClick={() => onOpenChange(false)}
            >
              Entrar
            </Button>
          </TabsContent>

          <TabsContent value="register" className="p-6 pt-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="seu@email.com"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Senha</Label>
              <Input
                id="reg-password"
                type="password"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400"
              />
            </div>
            <Button
              className="w-full bg-lime-400 text-black hover:bg-lime-500 font-bold"
              onClick={() => onOpenChange(false)}
            >
              Criar Conta
            </Button>
          </TabsContent>

          <div className="px-6 pb-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-2 text-zinc-500">Ou continue com</span>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white"
            >
              <Github className="mr-2 h-4 w-4" />
              Google (Exemplo)
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
