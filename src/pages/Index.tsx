import { useEffect, useState } from 'react'
import { getNovels } from '@/services/api'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { SectionHeader } from '@/components/SectionHeader'
import { NovelCard } from '@/components/NovelCard'
import { RankingTabs } from '@/components/home/RankingTabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Index() {
  const [novels, setNovels] = useState<any[]>([])

  useEffect(() => {
    getNovels({ sort: '-created' }).then((res) => setNovels(res.items))
  }, [])

  const trending = [...novels].sort((a, b) => (b.reads || 0) - (a.reads || 0)).slice(0, 8)
  const recent = [...novels].slice(0, 8)
  const originals = novels.filter((n) => n.type === 'Original').slice(0, 4)
  const hot = novels.filter((n) => n.is_hot)

  return (
    <div className="pb-16">
      {hot.length > 0 && <HeroCarousel novels={hot} />}

      <div className="container mx-auto px-4 mt-12 space-y-16">
        <section>
          <SectionHeader
            title="Em Alta esta Semana"
            action={
              <Link to="/explore">
                <Button variant="ghost" className="text-zinc-400 hover:text-lime-400">
                  Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          />
          <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex w-max space-x-4 p-1">
              {trending.map((novel) => (
                <NovelCard key={novel.id} novel={novel} className="w-[140px] md:w-[160px]" />
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="invisible hover:visible" />
          </ScrollArea>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <SectionHeader title="Recém Atualizados" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recent.map((novel) => (
                  <NovelCard key={novel.id} novel={novel} layout="dense" />
                ))}
              </div>
            </section>

            {originals.length > 0 && (
              <section>
                <SectionHeader title="Novidades Originais" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {originals.map((novel) => (
                    <NovelCard key={novel.id} novel={novel} layout="horizontal" />
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-12">
            <section>
              <SectionHeader title="Rankings da Semana" />
              <RankingTabs novels={novels} />
            </section>
          </aside>
        </div>

        <section>
          <SectionHeader title="Mais Populares" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {trending.map((novel) => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
