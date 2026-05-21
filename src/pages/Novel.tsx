import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getNovel, getChapters, getReviews, formatNumber, getCoverUrl } from '@/services/api'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Eye,
  Star,
  Lock,
  List,
  MessageSquare,
  Clock,
  Plus,
  Loader2,
  Bookmark,
  CheckCircle,
  BookOpen,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Novel() {
  const { id } = useParams()
  const { user } = useAuth()

  const [novel, setNovel] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [libraryEntry, setLibraryEntry] = useState<any>(null)

  useEffect(() => {
    if (id) {
      Promise.all([getNovel(id), getChapters(id), getReviews(id)])
        .then(async ([n, c, r]) => {
          if (user) {
            try {
              const entries = await pb
                .collection('library_entries')
                .getFullList({ filter: `user = "${user.id}" && novel = "${n.id}"` })
              if (entries.length > 0) setLibraryEntry(entries[0])
            } catch {
              /* intentionally ignored */
            }
          }
          setNovel(n)
          setChapters(c)
          setReviews(r)
          setLoading(false)
        })
        .catch((e) => {
          console.error(e)
          setLoading(false)
        })
    }
  }, [id])

  const handleUpdateLibrary = async (status: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para adicionar à biblioteca!')
      return
    }
    try {
      if (libraryEntry) {
        const updated = await pb.collection('library_entries').update(libraryEntry.id, { status })
        setLibraryEntry(updated)
        toast.success('Status atualizado com sucesso!')
      } else {
        const newEntry = await pb.collection('library_entries').create({
          user: user.id,
          novel: novel.id,
          status,
        })
        setLibraryEntry(newEntry)
        toast.success('Adicionado à biblioteca!')
      }
    } catch (e) {
      toast.error('Erro ao atualizar a biblioteca.')
    }
  }

  const handleRemoveLibrary = async () => {
    if (libraryEntry) {
      try {
        await pb.collection('library_entries').delete(libraryEntry.id)
        setLibraryEntry(null)
        toast.success('Obra removida da biblioteca.')
      } catch (e) {
        toast.error('Erro ao remover da biblioteca.')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-lime-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-zinc-500">
        <h2 className="text-2xl font-bold text-white mb-2">Obra não encontrada</h2>
        <p>A novel que você está procurando não existe ou foi removida.</p>
        <Link to="/explore" className="mt-6 text-lime-400 hover:underline">
          Voltar para Explorar
        </Link>
      </div>
    )
  }

  const coverUrl = getCoverUrl(novel)

  return (
    <div className="pb-20">
      <div className="w-full h-[300px] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0 mx-auto md:mx-0">
            <img
              src={coverUrl}
              alt={novel.title}
              className="w-[220px] h-[330px] object-cover rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </div>

          <div className="flex-1 pt-4 md:pt-12 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {novel.type === 'Original' && (
                <Badge className="bg-white text-black hover:bg-zinc-200">ORIGINAL</Badge>
              )}
              {novel.is_hot && (
                <Badge className="bg-lime-400 text-black hover:bg-lime-500 border-none">HOT</Badge>
              )}
              <Badge variant="outline" className="border-lime-400 text-lime-400">
                {novel.status}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{novel.title}</h1>
            <p className="text-lg text-lime-400 font-medium mb-6">
              {novel.expand?.author?.name || novel.expand?.author?.email || 'Autor Desconhecido'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm text-zinc-300 mb-8">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-zinc-500 text-xs uppercase font-bold">Lidas</span>
                <span className="flex items-center gap-1.5 font-semibold text-white mt-1">
                  <Eye className="w-4 h-4 text-zinc-400" /> {formatNumber(novel.reads)}
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-800 hidden md:block" />
              <div className="flex flex-col items-center md:items-start">
                <span className="text-zinc-500 text-xs uppercase font-bold">Avaliação</span>
                <span className="flex items-center gap-1.5 font-semibold text-white mt-1">
                  <Star className="w-4 h-4 text-lime-400 fill-lime-400" />{' '}
                  {novel.rating?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-800 hidden md:block" />
              <div className="flex flex-col items-center md:items-start">
                <span className="text-zinc-500 text-xs uppercase font-bold">Capítulos</span>
                <span className="flex items-center gap-1.5 font-semibold text-white mt-1">
                  <List className="w-4 h-4 text-zinc-400" /> {chapters.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {chapters.length > 0 ? (
                <Link to={`/novel/${novel.id}/chapter/1`}>
                  <Button className="w-full sm:w-auto bg-lime-400 text-black hover:bg-lime-500 font-bold px-8 h-12 rounded-xl text-base">
                    Ler Agora
                  </Button>
                </Link>
              ) : (
                <Button
                  disabled
                  className="w-full sm:w-auto bg-zinc-800 text-zinc-500 font-bold px-8 h-12 rounded-xl text-base"
                >
                  Sem Capítulos
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-white h-12 rounded-xl text-base px-6"
                  >
                    {libraryEntry ? (
                      <>
                        <Bookmark className="w-5 h-5 mr-2 text-lime-400 fill-lime-400" />
                        {libraryEntry.status === 'reading'
                          ? 'Lendo'
                          : libraryEntry.status === 'completed'
                            ? 'Concluído'
                            : 'Quero Ler'}
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Adicionar à Biblioteca
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-zinc-900 border-zinc-800 text-white w-48 rounded-xl">
                  <DropdownMenuItem
                    className="focus:bg-zinc-800 cursor-pointer"
                    onClick={() => handleUpdateLibrary('reading')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> Lendo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="focus:bg-zinc-800 cursor-pointer"
                    onClick={() => handleUpdateLibrary('plan_to_read')}
                  >
                    <Clock className="w-4 h-4 mr-2" /> Quero Ler
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="focus:bg-zinc-800 cursor-pointer"
                    onClick={() => handleUpdateLibrary('completed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" /> Concluído
                  </DropdownMenuItem>
                  {libraryEntry && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-800" />
                      <DropdownMenuItem
                        className="focus:bg-red-900/20 text-red-400 cursor-pointer"
                        onClick={handleRemoveLibrary}
                      >
                        Remover da Biblioteca
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto md:mx-0">
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="w-full sm:w-auto bg-zinc-900/50 p-1 rounded-xl mb-8 border border-zinc-800/50">
              <TabsTrigger
                value="about"
                className="flex-1 sm:w-32 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
              >
                Sobre
              </TabsTrigger>
              <TabsTrigger
                value="chapters"
                className="flex-1 sm:w-32 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
              >
                Capítulos ({chapters.length})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="flex-1 sm:w-32 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
              >
                Reviews ({reviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="about"
              className="animate-in fade-in slide-in-from-bottom-4 space-y-8"
            >
              <div className="prose prose-invert prose-zinc max-w-none">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                  <div className="w-1 h-5 bg-lime-400 rounded-full" />
                  Sinopse
                </h3>
                <p className="text-zinc-300 leading-relaxed text-lg whitespace-pre-wrap">
                  {novel.description || 'Nenhuma sinopse disponível.'}
                </p>
              </div>
              {novel.genres && novel.genres.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                    <div className="w-1 h-5 bg-lime-400 rounded-full" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {novel.genres.map((g: string) => (
                      <Badge
                        key={g}
                        variant="secondary"
                        className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800 px-3 py-1 text-sm rounded-full"
                      >
                        {g}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="chapters" className="animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-zinc-950/50 rounded-2xl border border-zinc-900 overflow-hidden">
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-900 flex justify-between items-center">
                  <span className="font-medium text-zinc-300">Índice</span>
                </div>
                <div className="divide-y divide-zinc-900/50 max-h-[500px] overflow-y-auto">
                  {chapters.map((chap) => (
                    <Link
                      key={chap.id}
                      to={`/novel/${novel.id}/chapter/${chap.chapter_number}`}
                      className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-500 font-mono w-8 text-right">
                          {chap.chapter_number}
                        </span>
                        <span className="text-zinc-200 group-hover:text-lime-400 transition-colors">
                          {chap.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-500 text-sm">
                        {chap.is_premium ? (
                          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-semibold">
                            <Lock className="w-3 h-3" /> PREMIUM
                          </div>
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                    </Link>
                  ))}
                  {chapters.length === 0 && (
                    <div className="p-8 text-center text-zinc-500">
                      Nenhum capítulo publicado ainda.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="reviews"
              className="animate-in fade-in slide-in-from-bottom-4 space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                  <div className="w-1 h-5 bg-lime-400 rounded-full" />
                  Comunidade
                </h3>
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Escrever Review
                </Button>
              </div>
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-zinc-800">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?seed=${rev.user}`}
                          />
                          <AvatarFallback>
                            {rev.expand?.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-zinc-200">
                            {rev.expand?.user?.name || rev.expand?.user?.email || 'Usuário'}
                          </p>
                          <div className="flex items-center text-lime-400 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(rev.rating) ? 'fill-current' : 'text-zinc-700'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{rev.content}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center text-zinc-500 py-8">
                    Nenhuma review ainda. Seja o primeiro!
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
