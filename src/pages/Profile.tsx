import { mockNovels } from '@/lib/mock'
import { NovelCard } from '@/components/NovelCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Settings, LogOut } from 'lucide-react'

export default function Profile() {
  return (
    <div className="pb-20">
      {/* Banner */}
      <div className="h-64 bg-zinc-900 w-full relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10" />
      </div>

      <div className="container mx-auto px-4 relative z-20 -mt-20">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
          <Avatar className="w-32 h-32 border-4 border-black ring-2 ring-lime-400 bg-zinc-800">
            <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?seed=user1" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-1">LeitorÁvido</h1>
            <p className="text-zinc-400">Membro desde 2024</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
            <Button
              variant="ghost"
              className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="reading" className="w-full">
          <TabsList className="bg-transparent border-b border-zinc-900 w-full justify-start rounded-none h-auto p-0 mb-8">
            <TabsTrigger
              value="reading"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-lime-400 data-[state=active]:bg-transparent px-6 py-3 text-base"
            >
              Lendo (3)
            </TabsTrigger>
            <TabsTrigger
              value="plan"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-lime-400 data-[state=active]:bg-transparent px-6 py-3 text-base text-zinc-400"
            >
              Quero Ler (12)
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-lime-400 data-[state=active]:bg-transparent px-6 py-3 text-base text-zinc-400"
            >
              Concluídos (45)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading" className="animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {mockNovels.slice(0, 3).map((novel) => (
                <div key={novel.id} className="relative group">
                  <NovelCard novel={novel} />
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-lime-400 border border-zinc-800">
                    Cap. 45/120
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="plan" className="animate-in fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {mockNovels.slice(4, 10).map((novel) => (
                <NovelCard key={novel.id} novel={novel} />
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="completed"
            className="animate-in fade-in text-center py-20 text-zinc-500"
          >
            <div className="text-4xl mb-4">🏆</div>
            <p>Você completou muitas obras. Histórico omitido neste mock.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
