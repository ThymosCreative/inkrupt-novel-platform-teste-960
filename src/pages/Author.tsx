import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BookPlus, LayoutDashboard, PenTool, BarChart, UploadCloud, Save, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Author() {
  const [activeTab, setActiveTab] = useState('editor')

  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'novels', icon: BookPlus, label: 'Minhas Obras' },
    { id: 'editor', icon: PenTool, label: 'Novo Capítulo' },
    { id: 'stats', icon: BarChart, label: 'Estatísticas' },
  ]

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950/50 flex-shrink-0 hidden md:block">
        <div className="p-6">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
            Centro de Criação
          </h2>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-lime-400/10 text-lime-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'editor' ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Criar Capítulo</h1>
              <div className="flex gap-3">
                <Button variant="outline" className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800">
                  <Save className="w-4 h-4 mr-2" /> Rascunho
                </Button>
                <Button className="bg-lime-400 text-black hover:bg-lime-500 font-bold">
                  <Send className="w-4 h-4 mr-2" /> Publicar
                </Button>
              </div>
            </div>

            <div className="space-y-6 bg-zinc-950/50 p-6 md:p-8 rounded-2xl border border-zinc-900">
              <div className="space-y-2">
                <Label htmlFor="novel">Selecione a Obra</Label>
                <select
                  id="novel"
                  className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
                >
                  <option>A Lenda do Caos</option>
                  <option>Caminho para a Imortalidade</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título do Capítulo</Label>
                <Input
                  id="title"
                  placeholder="Ex: Cap 42 - O Confronto"
                  className="bg-zinc-900 border-zinc-800 focus-visible:ring-lime-400 text-lg py-6"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Conteúdo</Label>
                  <span className="text-xs text-zinc-500">0 palavras</span>
                </div>
                {/* Fake Toolbar */}
                <div className="border border-zinc-800 rounded-t-md bg-zinc-900 p-2 flex gap-2 text-zinc-400">
                  <button className="p-1.5 hover:bg-zinc-800 rounded hover:text-white font-bold">
                    B
                  </button>
                  <button className="p-1.5 hover:bg-zinc-800 rounded hover:text-white italic">
                    I
                  </button>
                  <div className="w-px h-6 bg-zinc-800 self-center mx-1" />
                  <button className="p-1.5 hover:bg-zinc-800 rounded hover:text-white text-sm">
                    H1
                  </button>
                  <button className="p-1.5 hover:bg-zinc-800 rounded hover:text-white text-sm">
                    H2
                  </button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Comece a escrever sua história aqui..."
                  className="min-h-[400px] bg-zinc-950 border-zinc-800 border-t-0 rounded-t-none rounded-b-md focus-visible:ring-lime-400 text-base resize-y font-serif leading-relaxed"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4 animate-in fade-in">
            <UploadCloud className="w-16 h-16 opacity-20" />
            <p>Área de {sidebarItems.find((i) => i.id === activeTab)?.label} em construção.</p>
            <Button variant="outline" onClick={() => setActiveTab('editor')}>
              Ir para o Editor
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
