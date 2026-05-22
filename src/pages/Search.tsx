import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchNovels, getCoverUrl, getTrendingNovels } from '@/services/api'
import { Loader2, Search as SearchIcon, SlidersHorizontal, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const GENRES = [
  'Ação',
  'Aventura',
  'Comédia',
  'Drama',
  'Fantasia',
  'Ficção Científica',
  'Mistério',
  'Romance',
  'Terror',
  'Xianxia',
  'Wuxia',
]

const STATUSES = ['Em Andamento', 'Concluído', 'Hiato']
const TYPES = ['Original', 'Tradução']

const getHistory = () => {
  try {
    const saved = localStorage.getItem('inkrupt_search_history')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const status = searchParams.get('status') || 'all'
  const type = searchParams.get('type') || 'all'
  const sort = searchParams.get('sort') || (query ? 'semantic' : '-reads')
  const genresParam = searchParams.get('genres')
  const selectedGenres = genresParam ? genresParam.split(',') : []

  const [results, setResults] = useState<any[]>([])
  const [popular, setPopular] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<string[]>(getHistory())

  const updateParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v === 'all' || v === null || v === '') newParams.delete(k)
      else newParams.set(k, v)
    })
    setSearchParams(newParams)
  }

  const toggleGenre = (genre: string) => {
    const newGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre]

    updateParams({ genres: newGenres.length > 0 ? newGenres.join(',') : null })
  }

  useEffect(() => {
    setLoading(true)
    searchNovels({ query, status, type, genres: selectedGenres, sort, limit: 50 })
      .then((res) => setResults(res.items))
      .catch(console.error)
      .finally(() => setLoading(false))

    if (!query) {
      getTrendingNovels()
        .then((res) => setPopular(res.items))
        .catch(console.error)
    } else {
      setHistory(getHistory())
    }
  }, [query, status, type, genresParam, sort])

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold mb-3 text-lg text-white">Gêneros</h3>
        <div className="space-y-3">
          {GENRES.map((genre) => (
            <div key={genre} className="flex items-center space-x-2">
              <Checkbox
                id={`genre-${genre}`}
                checked={selectedGenres.includes(genre)}
                onCheckedChange={() => toggleGenre(genre)}
                className="border-zinc-700 data-[state=checked]:bg-lime-400 data-[state=checked]:text-black"
              />
              <Label
                htmlFor={`genre-${genre}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300 cursor-pointer hover:text-white transition-colors"
              >
                {genre}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      <div>
        <h3 className="font-bold mb-3 text-lg text-white">Status</h3>
        <div className="space-y-3">
          {['all', ...STATUSES].map((s) => (
            <div key={s} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`status-${s}`}
                name="status"
                checked={status === s}
                onChange={() => updateParams({ status: s })}
                className="w-4 h-4 text-lime-400 focus:ring-lime-400 bg-zinc-900 border-zinc-700 focus:ring-offset-zinc-900 cursor-pointer"
              />
              <Label
                htmlFor={`status-${s}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300 cursor-pointer hover:text-white transition-colors"
              >
                {s === 'all' ? 'Todos' : s}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-zinc-800" />

      <div>
        <h3 className="font-bold mb-3 text-lg text-white">Tipo</h3>
        <div className="space-y-3">
          {['all', ...TYPES].map((s) => (
            <div key={s} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`type-${s}`}
                name="type"
                checked={type === s}
                onChange={() => updateParams({ type: s })}
                className="w-4 h-4 text-lime-400 focus:ring-lime-400 bg-zinc-900 border-zinc-700 focus:ring-offset-zinc-900 cursor-pointer"
              />
              <Label
                htmlFor={`type-${s}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300 cursor-pointer hover:text-white transition-colors"
              >
                {s === 'all' ? 'Todos' : s}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {(status !== 'all' || type !== 'all' || selectedGenres.length > 0) && (
        <Button
          variant="outline"
          className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
          onClick={() => {
            const newParams = new URLSearchParams(searchParams)
            newParams.delete('status')
            newParams.delete('type')
            newParams.delete('genres')
            setSearchParams(newParams)
          }}
        >
          Limpar Filtros
        </Button>
      )}
    </div>
  )

  const renderGrid = (novels: any[]) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
      {novels.map((novel) => (
        <Link key={novel.id} to={`/novel/${novel.id}`} className="group">
          <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden hover:border-lime-400 transition-colors h-full flex flex-col">
            <div className="aspect-[2/3] overflow-hidden relative shrink-0">
              <img
                src={getCoverUrl(novel)}
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 bg-zinc-800"
              />
              {novel.rating ? (
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-lime-400 px-2 py-1 rounded text-xs font-bold shadow-lg">
                  ★ {novel.rating.toFixed(1)}
                </div>
              ) : null}
            </div>
            <CardContent className="p-3 sm:p-4 flex flex-col justify-center flex-1">
              <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-lime-400 transition-colors">
                {novel.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 truncate mt-1">
                {novel.expand?.author?.name || 'Autor'}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white pt-12 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FiltersContent />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h1 className="text-2xl sm:text-3xl font-black truncate">
                {query ? (
                  <>
                    Resultados para <span className="text-lime-400">"{query}"</span>
                  </>
                ) : (
                  'Explorar Obras'
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden border-zinc-700 text-white bg-transparent h-10"
                    >
                      <SlidersHorizontal className="w-4 h-4 mr-2" /> Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="bg-zinc-950 border-zinc-800 text-white p-6 overflow-y-auto"
                  >
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-white text-left">Filtros</SheetTitle>
                    </SheetHeader>
                    <FiltersContent />
                  </SheetContent>
                </Sheet>
                <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
                  <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-800 text-white h-10 focus:ring-lime-400">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="-reads" className="focus:bg-zinc-800 focus:text-lime-400">
                      Mais Populares
                    </SelectItem>
                    <SelectItem value="-rating" className="focus:bg-zinc-800 focus:text-lime-400">
                      Melhor Avaliadas
                    </SelectItem>
                    <SelectItem value="-created" className="focus:bg-zinc-800 focus:text-lime-400">
                      Mais Recentes
                    </SelectItem>
                    <SelectItem
                      value="-is_hot,-reads"
                      className="focus:bg-zinc-800 focus:text-lime-400"
                    >
                      Em Alta
                    </SelectItem>
                    {query && (
                      <SelectItem
                        value="semantic"
                        className="focus:bg-zinc-800 focus:text-lime-400"
                      >
                        Relevância Semântica
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32 text-lime-400">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : results.length > 0 ? (
              renderGrid(results)
            ) : !query && selectedGenres.length === 0 && status === 'all' && type === 'all' ? (
              <div className="animate-in fade-in duration-500">
                {history.length > 0 && (
                  <div className="mb-12">
                    <h3 className="font-bold mb-4 text-zinc-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Buscas Recentes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {history.map((h) => (
                        <Badge
                          key={h}
                          variant="secondary"
                          className="cursor-pointer bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 py-1.5 px-3 transition-colors"
                          onClick={() => updateParams({ q: h })}
                        >
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="font-black mb-6 text-xl text-white">Obras Populares</h3>
                  {popular.length > 0 ? (
                    renderGrid(popular)
                  ) : (
                    <div className="text-zinc-500 py-10">Carregando sugestões...</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/20 px-4">
                <SearchIcon className="w-12 h-12 text-zinc-600 mb-4" />
                <h2 className="text-xl font-bold mb-2">Nenhum resultado encontrado</h2>
                <p className="text-zinc-500 max-w-md mb-6">
                  Não encontramos nenhuma obra com esse termo ou filtros. Que tal mudar os filtros
                  ou buscar por gênero?
                </p>
                <Button
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams)
                    newParams.delete('status')
                    newParams.delete('type')
                    newParams.delete('genres')
                    newParams.delete('q')
                    setSearchParams(newParams)
                  }}
                  className="bg-lime-400 text-black hover:bg-lime-500 font-bold"
                >
                  Limpar Busca e Filtros
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
