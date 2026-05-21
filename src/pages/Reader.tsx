import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { mockNovels } from '@/lib/mock'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Slider } from '@/components/ui/slider'
import {
  Settings,
  List,
  Bookmark,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Reader() {
  const { id, num } = useParams()
  const navigate = useNavigate()
  const chapterNum = parseInt(num || '1', 10)

  const novel = mockNovels.find((n) => n.id === id) || mockNovels[0]
  const chapter = novel.chapters[chapterNum - 1]

  const [progress, setProgress] = useState(0)
  const [settings, setSettings] = useState({
    theme: 'dark', // 'dark' | 'sepia' | 'light'
    fontSize: 18,
  })

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scroll = `${(totalScroll / windowHeight) * 100}`
      setProgress(Number(scroll))
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Capítulo não encontrado.
      </div>
    )
  }

  const themeClasses = {
    dark: 'bg-black text-zinc-300',
    sepia: 'bg-[#1e1c18] text-[#c9bfae]',
    light: 'bg-zinc-50 text-zinc-900',
  }

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-500 pb-32',
        themeClasses[settings.theme as keyof typeof themeClasses],
      )}
    >
      {/* Reading Progress */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-zinc-900 z-50">
        <div
          className="h-full bg-lime-400 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Sticky Header */}
      <header
        className={cn(
          'sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors',
          settings.theme === 'light'
            ? 'bg-white/90 border-zinc-200'
            : 'bg-black/80 border-zinc-900',
        )}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <Link
            to={`/novel/${novel.id}`}
            className="flex items-center gap-3 text-sm font-medium hover:text-lime-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{novel.title}</span>
          </Link>
          <div className="text-sm font-bold opacity-70">Capítulo {chapterNum}</div>
          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Floating Sidebar */}
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-40">
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-lime-400 flex items-center justify-center backdrop-blur-sm transition-all shadow-xl">
              <Settings className="w-5 h-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            className="w-72 bg-zinc-950 border-zinc-800 p-6 rounded-2xl mr-4"
          >
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Tamanho da Fonte</h4>
                <Slider
                  value={[settings.fontSize]}
                  min={14}
                  max={26}
                  step={1}
                  onValueChange={([v]) => setSettings((s) => ({ ...s, fontSize: v }))}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-zinc-600 font-serif">
                  <span>A</span>
                  <span className="text-lg">A</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-3">Tema</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSettings((s) => ({ ...s, theme: 'dark' }))}
                    className="flex-1 h-10 rounded-lg bg-black border-2 border-zinc-800 focus:border-lime-400"
                  />
                  <button
                    onClick={() => setSettings((s) => ({ ...s, theme: 'sepia' }))}
                    className="flex-1 h-10 rounded-lg bg-[#1e1c18] border-2 border-zinc-800 focus:border-lime-400"
                  />
                  <button
                    onClick={() => setSettings((s) => ({ ...s, theme: 'light' }))}
                    className="flex-1 h-10 rounded-lg bg-zinc-50 border-2 border-zinc-300 focus:border-lime-400"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <button className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-lime-400 flex items-center justify-center backdrop-blur-sm transition-all shadow-xl">
          <List className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-lime-400 hover:border-lime-400 flex items-center justify-center backdrop-blur-sm transition-all shadow-xl">
          <Bookmark className="w-5 h-5" />
        </button>
        <button className="w-12 h-12 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white hover:border-lime-400 flex items-center justify-center backdrop-blur-sm transition-all shadow-xl relative">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 bg-lime-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            12
          </span>
        </button>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 max-w-3xl mt-12 mb-20">
        <h1
          className="text-3xl md:text-4xl font-bold mb-12 text-center"
          style={{ color: settings.theme === 'light' ? '#000' : '#fff' }}
        >
          {chapter.title}
        </h1>

        <div
          className="text-reader whitespace-pre-wrap"
          style={{ fontSize: `${settings.fontSize}px` }}
        >
          {chapter.content}

          {/* Mock extra content for scrolling */}
          {
            '\n\nEle não podia acreditar no que via. A imensidão do abismo à sua frente parecia devorar a própria luz. As lendas antigas falavam desse lugar, mas nada poderia prepará-lo para a realidade aterradora que agora enfrentava.\n\nSua espada tremia levemente, não por medo, mas pela ressonância da energia densa que emanava das profundezas. Ele apertou o cabo, firmando sua determinação. Não havia volta. O destino de seu clã, de sua família, dependia do que ele encontraria ali embaixo.\n\nCom um suspiro profundo, ele deu o primeiro passo no vazio.'
          }
        </div>
      </main>

      {/* Footer Nav */}
      <div className="container mx-auto px-4 max-w-3xl flex justify-between gap-4">
        <button
          onClick={() => navigate(`/novel/${novel.id}/chapter/${chapterNum - 1}`)}
          disabled={chapterNum === 1}
          className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-white"
        >
          <ChevronLeft className="w-5 h-5" />
          Anterior
        </button>
        <button
          onClick={() => navigate(`/novel/${novel.id}/chapter/${chapterNum + 1}`)}
          disabled={chapterNum === novel.chapters.length}
          className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-lime-400 hover:bg-lime-500 text-black shadow-lg shadow-lime-900/20"
        >
          Próximo
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
