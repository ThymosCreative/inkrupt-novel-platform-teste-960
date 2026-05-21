import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { getCoverUrl } from '@/services/api'

export function RankingTabs({ novels }: { novels: any[] }) {
  const renderList = (sorted: any[]) => (
    <div className="space-y-4">
      {sorted.slice(0, 10).map((novel, i) => (
        <Link
          key={novel.id}
          to={`/novel/${novel.id}`}
          className="group flex items-center gap-4 bg-zinc-900/40 hover:bg-zinc-800/80 p-3 rounded-xl transition-all"
        >
          <div
            className={cn(
              'w-8 text-center font-black text-xl italic',
              i === 0
                ? 'text-lime-400 text-3xl'
                : i < 3
                  ? 'text-zinc-100 text-2xl'
                  : 'text-zinc-600',
            )}
          >
            {i + 1}
          </div>
          <img
            src={getCoverUrl(novel)}
            alt={novel.title}
            className="w-14 h-20 object-cover rounded shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate group-hover:text-lime-400 transition-colors text-zinc-100">
              {novel.title}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">{novel.expand?.author?.name || 'Autor'}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
              {novel.genres?.[0] && (
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                  {novel.genres[0]}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-lime-400" /> {novel.rating?.toFixed(1) || 'N/A'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  return (
    <Tabs defaultValue="rating" className="w-full">
      <TabsList className="w-full bg-zinc-900 p-1 rounded-xl mb-6">
        <TabsTrigger
          value="rating"
          className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
        >
          Avaliação
        </TabsTrigger>
        <TabsTrigger
          value="reads"
          className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
        >
          Mais Lidos
        </TabsTrigger>
        <TabsTrigger
          value="recent"
          className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
        >
          Novos
        </TabsTrigger>
      </TabsList>
      <TabsContent value="rating">
        {renderList([...novels].sort((a, b) => (b.rating || 0) - (a.rating || 0)))}
      </TabsContent>
      <TabsContent value="reads">
        {renderList([...novels].sort((a, b) => (b.reads || 0) - (a.reads || 0)))}
      </TabsContent>
      <TabsContent value="recent">
        {renderList(
          [...novels].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()),
        )}
      </TabsContent>
    </Tabs>
  )
}
