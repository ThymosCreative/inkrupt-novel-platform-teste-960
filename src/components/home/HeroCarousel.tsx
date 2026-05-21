import { Novel } from '@/lib/mock'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Play, Plus } from 'lucide-react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { useRef } from 'react'

export function HeroCarousel({ novels }: { novels: Novel[] }) {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: true }))
  const topNovels = novels.slice(0, 5)

  return (
    <div className="w-full relative group">
      <Carousel plugins={[plugin.current]} className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {topNovels.map((novel) => (
            <CarouselItem key={novel.id} className="relative w-full h-[480px]">
              <div
                className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110"
                style={{ backgroundImage: `url(${novel.coverUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-4 md:px-12 grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6 z-10 animate-fade-in-up">
                    <div className="flex gap-2">
                      <Badge className="bg-lime-400 text-black hover:bg-lime-500 border-none">
                        EM DESTAQUE
                      </Badge>
                      {novel.genres.map((g) => (
                        <Badge key={g} variant="outline" className="border-zinc-700 text-zinc-300">
                          {g}
                        </Badge>
                      ))}
                    </div>
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
                        {novel.title}
                      </h1>
                      <p className="text-lime-400 font-medium">{novel.author}</p>
                    </div>
                    <p className="text-zinc-300 line-clamp-3 text-lg max-w-lg">{novel.synopsis}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <Link to={`/novel/${novel.id}`}>
                        <Button className="bg-lime-400 text-black hover:bg-lime-500 font-bold px-8 h-12 rounded-xl">
                          <Play className="w-4 h-4 mr-2 fill-current" />
                          Ler Agora
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        className="border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 text-white h-12 rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Biblioteca
                      </Button>
                    </div>
                  </div>
                  <div className="hidden md:flex justify-end z-10">
                    <Link to={`/novel/${novel.id}`}>
                      <img
                        src={novel.coverUrl}
                        alt={novel.title}
                        className="w-[280px] h-[400px] object-cover rounded-2xl shadow-2xl shadow-lime-900/20 hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-8 right-12 hidden md:flex gap-2 z-20">
          <CarouselPrevious className="relative inset-0 translate-y-0 h-10 w-10 bg-zinc-900/80 border-zinc-700 hover:bg-lime-400 hover:text-black hover:border-lime-400 transition-colors" />
          <CarouselNext className="relative inset-0 translate-y-0 h-10 w-10 bg-zinc-900/80 border-zinc-700 hover:bg-lime-400 hover:text-black hover:border-lime-400 transition-colors" />
        </div>
      </Carousel>
    </div>
  )
}
