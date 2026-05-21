import { Novel, formatNumber } from '@/lib/mock'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Eye, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NovelCardProps {
  novel: Novel
  layout?: 'vertical' | 'horizontal' | 'dense'
  className?: string
}

export function NovelCard({ novel, layout = 'vertical', className }: NovelCardProps) {
  if (layout === 'dense') {
    return (
      <Link
        to={`/novel/${novel.id}`}
        className={cn(
          'group flex items-center gap-4 bg-zinc-900/50 hover:bg-zinc-800/80 p-3 rounded-xl transition-all',
          className,
        )}
      >
        <img
          src={novel.coverUrl}
          alt={novel.title}
          className="w-12 h-16 object-cover rounded-md shadow-md"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate group-hover:text-lime-400 transition-colors">
            {novel.title}
          </h4>
          <p className="text-xs text-zinc-400 mt-1">Capítulo {novel.chapters.length}</p>
        </div>
        <div className="text-xs text-zinc-500 whitespace-nowrap">há 2h</div>
      </Link>
    )
  }

  if (layout === 'horizontal') {
    return (
      <Link
        to={`/novel/${novel.id}`}
        className={cn(
          'group flex gap-4 bg-zinc-900 p-3 rounded-xl hover:scale-[1.02] transition-all duration-300',
          className,
        )}
      >
        <div className="relative shrink-0">
          <img
            src={novel.coverUrl}
            alt={novel.title}
            className="w-24 h-36 object-cover rounded-lg shadow-lg"
          />
          {novel.isHot && (
            <Badge className="absolute -top-2 -left-2 bg-lime-400 text-black border-none">
              HOT
            </Badge>
          )}
        </div>
        <div className="flex flex-col justify-center py-1 overflow-hidden">
          <h3 className="font-bold text-lg leading-tight group-hover:text-lime-400 transition-colors truncate">
            {novel.title}
          </h3>
          <p className="text-sm text-zinc-400 mt-1 truncate">{novel.author}</p>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-3">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatNumber(novel.reads)}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-lime-400" /> 4.8
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{novel.synopsis}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/novel/${novel.id}`}
      className={cn(
        'group flex flex-col gap-3 hover:scale-[1.02] transition-all duration-300',
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-lg">
        <img
          src={novel.coverUrl}
          alt={novel.title}
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
        />
        {novel.isOriginal && (
          <Badge className="absolute top-2 right-2 bg-white text-black border-none text-[10px] px-1.5">
            ORIGINAL
          </Badge>
        )}
      </div>
      <div>
        <h3 className="font-semibold text-sm leading-tight group-hover:text-lime-400 transition-colors line-clamp-2">
          {novel.title}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 truncate">{novel.author}</p>
      </div>
    </Link>
  )
}
