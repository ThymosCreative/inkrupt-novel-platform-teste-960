import { useState, useEffect } from 'react'
import { getNovels } from '@/services/api'
import { NovelCard } from '@/components/NovelCard'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const FILTERS = {
  category: ['Todos', 'Fantasia', 'Romance', 'Ação', 'Mistério', 'Xianxia'],
  status: ['Todos', 'Em Andamento', 'Concluído'],
  type: ['Todos', 'Original', 'Tradução'],
  sort: ['Popularidade', 'Novos', 'Avaliação'],
}

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    category: 'Todos',
    status: 'Todos',
    type: 'Todos',
    sort: 'Mais lidos',
  })

  const [novels, setNovels] = useState<any[]>([])

  useEffect(() => {
    let filterParts = []
    if (searchQuery.trim()) {
      filterParts.push(`(title ~ "${searchQuery.trim()}" || description ~ "${searchQuery.trim()}")`)
    }
    if (activeFilters.category !== 'Todos') filterParts.push(`genres ~ "${activeFilters.category}"`)
    if (activeFilters.status !== 'Todos') filterParts.push(`status = "${activeFilters.status}"`)
    if (activeFilters.type !== 'Todos') filterParts.push(`type = "${activeFilters.type}"`)

    let sortStr = ''
    if (activeFilters.sort === 'Mais lidos') sortStr = '-reads'
    else if (activeFilters.sort === 'Mais recentes') sortStr = '-created'
    else if (activeFilters.sort === 'Mais avaliados') sortStr = '-rating'

    const timer = setTimeout(() => {
      getNovels({ filter: filterParts.join(' && '), sort: sortStr }).then((res) =>
        setNovels(res.items),
      )
    }, 300)

    return () => clearTimeout(timer)
  }, [activeFilters, searchQuery])

  const updateFilter = (group: keyof typeof FILTERS, value: string) => {
    setActiveFilters((prev) => ({ ...prev, [group]: value }))
  }

  const PillGroup = ({
    title,
    group,
    options,
  }: {
    title: string
    group: keyof typeof FILTERS
    options: string[]
  }) => (
    <div className="flex items-start md:items-center flex-col md:flex-row gap-3">
      <span className="text-zinc-500 text-sm font-medium w-24 shrink-0">{title}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = activeFilters[group] === opt
          return (
            <button
              key={opt}
              onClick={() => updateFilter(group, opt)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                isActive
                  ? 'bg-lime-400 text-black'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200',
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-white">
        <div className="w-1.5 h-8 bg-lime-400 rounded-full" />
        Explorar Biblioteca
      </h1>

      <div className="bg-zinc-950/50 border border-zinc-900 p-6 rounded-2xl space-y-6 mb-12">
        <div className="relative max-w-md mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou descrição..."
            className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-lime-400"
          />
        </div>

        <PillGroup title="Categoria" group="category" options={FILTERS.category} />
        <PillGroup title="Status" group="status" options={FILTERS.status} />
        <PillGroup title="Tipo" group="type" options={FILTERS.type} />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <span className="text-zinc-500 text-sm font-medium w-24 shrink-0">Ordenar por</span>
          <Select value={activeFilters.sort} onValueChange={(val) => updateFilter('sort', val)}>
            <SelectTrigger className="w-[200px] bg-zinc-900 border-zinc-800 text-white rounded-xl focus:ring-lime-400">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-xl">
              <SelectItem
                value="Mais lidos"
                className="focus:bg-zinc-800 focus:text-lime-400 cursor-pointer"
              >
                Mais lidos
              </SelectItem>
              <SelectItem
                value="Mais avaliados"
                className="focus:bg-zinc-800 focus:text-lime-400 cursor-pointer"
              >
                Mais avaliados
              </SelectItem>
              <SelectItem
                value="Mais recentes"
                className="focus:bg-zinc-800 focus:text-lime-400 cursor-pointer"
              >
                Mais recentes
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-12">
        {novels.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
        {novels.length === 0 && (
          <div className="col-span-full text-center text-zinc-500 py-12">
            Nenhum resultado encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
