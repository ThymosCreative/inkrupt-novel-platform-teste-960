import { useParams, Link } from 'react-router-dom'
import { mockNovels, formatNumber } from '@/lib/mock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Star, Lock, List, MessageSquare, Clock, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Novel() {
  const { id } = useParams()
  const novel = mockNovels.find((n) => n.id === id) || mockNovels[0]

  return (
    <div className="pb-20">
      {/* Header Background */}
      <div className="w-full h-[300px] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110"
          style={{ backgroundImage: `url(${novel.coverUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover */}
          <div className="shrink-0 mx-auto md:mx-0">
            <img
              src={novel.coverUrl}
              alt={novel.title}
              className="w-[220px] h-[330px] object-cover rounded-2xl shadow-2xl ring-1 ring-white/10"
            />
          </div>

          {/* Info */}
          <div className="flex-1 pt-4 md:pt-12 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {novel.isOriginal && (
                <Badge className="bg-white text-black hover:bg-zinc-200">ORIGINAL</Badge>
              )}
              {novel.isHot && (
                <Badge className="bg-lime-400 text-black hover:bg-lime-500 border-none">HOT</Badge>
              )}
              <Badge variant="outline" className="border-lime-400 text-lime-400">
                {novel.status}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{novel.title}</h1>
            <p className="text-lg text-lime-400 font-medium mb-6">{novel.author}</p>

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
                  <Star className="w-4 h-4 text-lime-400 fill-lime-400" /> 4.8{' '}
                  <span className="text-zinc-500 font-normal">({formatNumber(novel.votes)})</span>
                </span>
              </div>
              <div className="w-px h-8 bg-zinc-800 hidden md:block" />
              <div className="flex flex-col items-center md:items-start">
                <span className="text-zinc-500 text-xs uppercase font-bold">Capítulos</span>
                <span className="flex items-center gap-1.5 font-semibold text-white mt-1">
                  <List className="w-4 h-4 text-zinc-400" /> {novel.chapters.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to={`/novel/${novel.id}/chapter/1`}>
                <Button className="w-full sm:w-auto bg-lime-400 text-black hover:bg-lime-500 font-bold px-8 h-12 rounded-xl text-base">
                  Ler Agora
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full sm:w-auto border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-white h-12 rounded-xl text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                Adicionar à Biblioteca
              </Button>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
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
                Capítulos ({novel.chapters.length})
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="flex-1 sm:w-32 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="about"
              className="animate-in fade-in slide-in-from-bottom-4 space-y-8"
            >
              <div className="prose prose-invert prose-zinc max-w-none">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-lime-400 rounded-full" />
                  Sinopse
                </h3>
                <p className="text-zinc-300 leading-relaxed text-lg">{novel.synopsis}</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-lime-400 rounded-full" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {novel.genres.map((g) => (
                    <Badge
                      key={g}
                      variant="secondary"
                      className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800 px-3 py-1 text-sm rounded-full"
                    >
                      {g}
                    </Badge>
                  ))}
                  <Badge
                    variant="secondary"
                    className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800 px-3 py-1 text-sm rounded-full"
                  >
                    Aventura Épica
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800 px-3 py-1 text-sm rounded-full"
                  >
                    Magia
                  </Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chapters" className="animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-zinc-950/50 rounded-2xl border border-zinc-900 overflow-hidden">
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-900 flex justify-between items-center">
                  <span className="font-medium text-zinc-300">Índice</span>
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                    Mais Recentes <Clock className="w-4 h-4 ml-2" />
                  </Button>
                </div>
                <div className="divide-y divide-zinc-900/50 max-h-[500px] overflow-y-auto">
                  {novel.chapters.map((chap, i) => (
                    <Link
                      key={chap.id}
                      to={`/novel/${novel.id}/chapter/${i + 1}`}
                      className="flex items-center justify-between p-4 hover:bg-zinc-900/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-zinc-500 font-mono w-8 text-right">{i + 1}</span>
                        <span className="text-zinc-200 group-hover:text-lime-400 transition-colors">
                          {chap.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-500 text-sm">
                        <span>há 2 dias</span>
                        {chap.isPremium ? (
                          <Lock className="w-4 h-4 text-amber-500" />
                        ) : (
                          <div className="w-4" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="reviews"
              className="animate-in fade-in slide-in-from-bottom-4 space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <div className="w-1 h-5 bg-lime-400 rounded-full" />
                  Comunidade
                </h3>
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Escrever Review
                </Button>
              </div>
              <div className="space-y-4">
                {novel.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-900"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border border-zinc-800">
                          <AvatarImage
                            src={`https://img.usecurling.com/ppl/thumbnail?seed=${rev.userId}`}
                          />
                          <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-zinc-200">{rev.userName}</p>
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
                      <span className="text-xs text-zinc-500">há 1 semana</span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed">{rev.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
