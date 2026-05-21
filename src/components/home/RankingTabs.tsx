import { Novel, formatNumber } from '@/lib/mock'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

export function RankingTabs({ novels }: { novels: Novel[] }) {
  const renderList = (sorted: Novel[]) => (
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
            src={novel.coverUrl}
            alt={novel.title}
            className="w-14 h-20 object-cover rounded shadow-md"
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate group-hover:text-lime-400 transition-colors">
              {novel.title}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">{novel.author}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                {novel.genres[0]}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-lime-400" /> 4.9
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )

  return (
    <Tabs defaultValue="power" className="w-full">
      <TabsList className="w-full bg-zinc-900 p-1 rounded-xl mb-6">
        <TabsTrigger
          value="power"
          className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
        >
          Power Stone
        </TabsTrigger>
        <TabsTrigger
          value="reads"
          className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
        >
          Mais Lidos
        </TabsTrigger>
        <TabsTrigger
          value="rating"
          className="flex-1 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-lime-400"
        >
          Avaliação
        </TabsTrigger>
      </TabsList>
      <TabsContent value="power">
        {renderList([...novels].sort((a, b) => b.votes - a.votes))}
      </TabsContent>
      <TabsContent value="reads">
        {renderList([...novels].sort((a, b) => b.reads - a.reads))}
      </TabsContent>
      <TabsContent value="rating">{renderList([...novels])}</TabsContent>
    </Tabs>
  )
}
