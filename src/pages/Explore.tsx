import { useState, useEffect } from 'react'
import { getNovels } from '@/services/api'
import { NovelCard } from '@/components/NovelCard'
import { cn } from '@/lib/utils'

const FILTERS = {
  category: ['Todos', 'Fantasia', 'Romance', 'Ação', 'Mistério', 'Xianxia'],
  status: ['Todos', 'Em Andamento', 'Concluído'],
  type: ['Todos', 'Original', 'Tradução'],
  sort: ['Popularidade', 'Novos', 'Avaliação'],
}

export default function Explore() {
  const [activeFilters, setActiveFilters] = useState({
    category: 'Todos',
    status: 'Todos',
    type: 'Todos',
    sort: 'Popularidade',
  })

  const [novels, setNovels] = useState<any[]>([])

  useEffect(() => {
    let filterParts = []
    if (activeFilters.category !== 'Todos') filterParts.push(`genres ~ "${activeFilters.category}"`)
    if (activeFilters.status !== 'Todos') filterParts.push(`status = "${activeFilters.status}"`)
    if (activeFilters.type !== 'Todos') filterParts.push(`type = "${activeFilters.type}"`)

    let sortStr = ''
    if (activeFilters.sort === 'Popularidade') sortStr = '-reads'
    else if (activeFilters.sort === 'Novos') sortStr = '-created'
    else if (activeFilters.sort === 'Avaliação') sortStr = '-rating'

    getNovels({ filter: filterParts.join(' && '), sort: sortStr }).then((res) =>
      setNovels(res.items),
    )
  }, [activeFilters])

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
        <PillGroup title="Categoria" group="category" options={FILTERS.category} />
        <PillGroup title="Status" group="status" options={FILTERS.status} />
        <PillGroup title="Tipo" group="type" options={FILTERS.type} />
        <PillGroup title="Ordenar por" group="sort" options={FILTERS.sort} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6 mb-12">
        {novels.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
        {novels.length === 0 && (
          <div className="col-span-full text-center text-zinc-500 py-12">
            Nenhuma obra encontrada.
          </div>
        )}
      </div>
    </div>
  )
}
