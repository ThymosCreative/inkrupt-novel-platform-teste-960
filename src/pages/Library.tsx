import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { getCoverUrl } from '@/services/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Loader2, BookOpen, Clock, CheckCircle, List } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'

export default function Library() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadLibrary = () => {
    if (user) {
      pb.collection('library_entries')
        .getFullList({
          filter: `user = "${user.id}"`,
          expand: 'novel,novel.author,last_chapter',
          sort: '-updated',
        })
        .then((res) => {
          setEntries(res)
          setLoading(false)
        })
        .catch(console.error)
    }
  }

  useEffect(() => {
    loadLibrary()
  }, [user])

  useRealtime(
    'library_entries',
    () => {
      loadLibrary()
    },
    !!user,
  )

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    )
  }

  const all = entries
  const reading = entries.filter((e) => e.status === 'reading')
  const planToRead = entries.filter((e) => e.status === 'plan_to_read')
  const completed = entries.filter((e) => e.status === 'completed')

  const EntryGrid = ({ items }: { items: any[] }) => {
    if (items.length === 0) {
      return (
        <div className="py-20 text-center flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Sua lista está vazia</h3>
          <p className="text-zinc-400 mb-6 max-w-md">
            Você ainda não adicionou nenhuma obra a esta lista. Que tal explorar novas histórias
            incríveis?
          </p>
          <Link to="/explore">
            <Button className="bg-lime-400 text-black hover:bg-lime-500 font-bold px-8">
              Explorar Obras
            </Button>
          </Link>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((entry) => {
          const novel = entry.expand?.novel
          if (!novel) return null
          return (
            <Link key={entry.id} to={`/novel/${novel.id}`} className="group relative block">
              <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 bg-zinc-900 border border-zinc-800">
                <img
                  src={getCoverUrl(novel)}
                  alt={novel.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-lime-400 transition-colors">
                {novel.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 truncate">
                {novel.expand?.author?.name || novel.expand?.author?.email || 'Autor'}
              </p>
              {entry.expand?.last_chapter && (
                <p className="text-[10px] text-lime-400 mt-1 truncate font-medium">
                  Último lido: Cap. {entry.expand.last_chapter.chapter_number}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl min-h-[calc(100vh-4rem)]">
      <h1 className="text-3xl font-black text-white mb-8">Minha Biblioteca</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-8 flex w-full md:w-auto overflow-x-auto justify-start h-auto p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
          >
            <List className="w-4 h-4" /> Todas ({all.length})
          </TabsTrigger>
          <TabsTrigger
            value="reading"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
          >
            <BookOpen className="w-4 h-4" /> Lendo ({reading.length})
          </TabsTrigger>
          <TabsTrigger
            value="plan_to_read"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
          >
            <Clock className="w-4 h-4" /> Quero Ler ({planToRead.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex items-center gap-2 py-2.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
          >
            <CheckCircle className="w-4 h-4" /> Concluído ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <EntryGrid items={all} />
        </TabsContent>
        <TabsContent value="reading">
          <EntryGrid items={reading} />
        </TabsContent>
        <TabsContent value="plan_to_read">
          <EntryGrid items={planToRead} />
        </TabsContent>
        <TabsContent value="completed">
          <EntryGrid items={completed} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
