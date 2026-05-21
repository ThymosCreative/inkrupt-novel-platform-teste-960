import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Camera, Save, Type, Sun, Moon, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Settings() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatar
      ? pb.files.getURL(user, user.avatar)
      : `https://img.usecurling.com/ppl/thumbnail?seed=${user?.id}`,
  )
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [preferences, setPreferences] = useState({
    theme: user?.preferences?.theme || 'dark',
    fontSize: user?.preferences?.fontSize || 'M',
    spacing: user?.preferences?.spacing || 'normal',
  })

  useEffect(() => {
    if (user) {
      if (!name && !avatarFile) {
        setName(user.name || '')
        if (user.avatar) {
          setAvatarPreview(pb.files.getURL(user, user.avatar))
        }
      }
      if (user.preferences) {
        setPreferences((prev) => ({ ...prev, ...user.preferences }))
      }
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5242880) {
        toast({
          title: 'Arquivo muito grande',
          description: 'A imagem deve ter no máximo 5MB.',
          variant: 'destructive',
        })
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return
    if (!name.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, insira um nome de exibição.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('name', name)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      await pb.collection('users').update(user.id, formData)
      await pb.collection('users').authRefresh()

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      })
      setAvatarFile(null)
    } catch (error: any) {
      console.error(error)
      toast({
        title: 'Erro ao salvar',
        description:
          error?.response?.message || 'Ocorreu um erro ao atualizar o perfil. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (key: string, value: string) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    if (user) {
      try {
        await pb.collection('users').update(user.id, { preferences: newPrefs })
        await pb.collection('users').authRefresh()
      } catch (e) {
        toast({ title: 'Erro ao salvar preferências', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-black text-white mb-8">Configurações da Conta</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-8 p-1 rounded-xl h-auto w-full flex">
          <TabsTrigger
            value="profile"
            className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
          >
            Perfil Público
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex-1 py-2.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
          >
            Preferências de Leitura
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Informações Pessoais</CardTitle>
              <CardDescription className="text-zinc-400">
                Atualize suas informações pessoais que serão exibidas para outros usuários.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div
                    className="relative w-24 h-24 group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="w-24 h-24 border-2 border-zinc-700 bg-zinc-800 transition-all group-hover:border-lime-400">
                      <AvatarImage src={avatarPreview || ''} className="object-cover" />
                      <AvatarFallback className="text-2xl">
                        {name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center">
                      <Camera className="w-6 h-6 text-white mb-1" />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-white mb-1">Foto de Perfil</h3>
                    <p className="text-sm text-zinc-400 mb-3">
                      Recomendado: Imagem quadrada (JPG ou PNG). Tamanho máximo 5MB.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Alterar Imagem
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-zinc-400">
                      Email
                    </Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-zinc-800/50 border-zinc-800 text-zinc-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-zinc-500">
                      O endereço de email não pode ser alterado.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-200">
                      Nome de Exibição
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="bg-zinc-800 border-zinc-700 text-white focus-visible:ring-lime-400 focus-visible:border-lime-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={loading || (!name.trim() && !avatarFile)}
                    className="bg-lime-400 text-black hover:bg-lime-500 font-bold px-8"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Leitura e Ambiente</CardTitle>
              <CardDescription className="text-zinc-400">
                Ajuste como os capítulos são exibidos para você. Essas configurações são aplicadas
                automaticamente no leitor.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="text-zinc-200">Tema do Leitor</Label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => updatePreference('theme', 'dark')}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      preferences.theme === 'dark'
                        ? 'border-lime-400 bg-lime-400/5'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950',
                    )}
                  >
                    <Moon
                      className={cn(
                        'w-6 h-6',
                        preferences.theme === 'dark' ? 'text-lime-400' : 'text-zinc-400',
                      )}
                    />
                    <span
                      className={cn(
                        'font-medium text-sm',
                        preferences.theme === 'dark' ? 'text-lime-400' : 'text-zinc-400',
                      )}
                    >
                      Escuro
                    </span>
                  </button>
                  <button
                    onClick={() => updatePreference('theme', 'sepia')}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all bg-[#f4ecd8]',
                      preferences.theme === 'sepia'
                        ? 'border-lime-500'
                        : 'border-[#e6dcc0] hover:border-[#d4c8a8]',
                    )}
                  >
                    <Coffee
                      className={cn(
                        'w-6 h-6',
                        preferences.theme === 'sepia' ? 'text-[#5b4636]' : 'text-[#8a7258]',
                      )}
                    />
                    <span
                      className={cn(
                        'font-medium text-sm',
                        preferences.theme === 'sepia' ? 'text-[#5b4636]' : 'text-[#8a7258]',
                      )}
                    >
                      Sépia
                    </span>
                  </button>
                  <button
                    onClick={() => updatePreference('theme', 'light')}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all bg-white',
                      preferences.theme === 'light'
                        ? 'border-lime-500'
                        : 'border-zinc-200 hover:border-zinc-300',
                    )}
                  >
                    <Sun
                      className={cn(
                        'w-6 h-6',
                        preferences.theme === 'light' ? 'text-black' : 'text-zinc-500',
                      )}
                    />
                    <span
                      className={cn(
                        'font-medium text-sm',
                        preferences.theme === 'light' ? 'text-black' : 'text-zinc-500',
                      )}
                    >
                      Claro
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-200">Tamanho da Fonte</Label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updatePreference('fontSize', s)}
                      className={cn(
                        'flex-1 h-12 rounded-lg border-2 font-medium transition-colors',
                        preferences.fontSize === s
                          ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                          : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800',
                      )}
                    >
                      <Type
                        className={cn(
                          'mx-auto',
                          s === 'S'
                            ? 'w-3 h-3'
                            : s === 'M'
                              ? 'w-4 h-4'
                              : s === 'L'
                                ? 'w-5 h-5'
                                : 'w-6 h-6',
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-zinc-200">Espaçamento de Linhas</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updatePreference('spacing', 'normal')}
                    className={cn(
                      'flex-1 h-12 rounded-lg border-2 font-medium transition-colors',
                      preferences.spacing === 'normal'
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                        : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800',
                    )}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => updatePreference('spacing', 'amplo')}
                    className={cn(
                      'flex-1 h-12 rounded-lg border-2 font-medium transition-colors',
                      preferences.spacing === 'amplo'
                        ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                        : 'border-zinc-800 text-zinc-400 hover:bg-zinc-800',
                    )}
                  >
                    Amplo
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
