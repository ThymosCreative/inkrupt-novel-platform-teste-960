import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { NovelCard } from '@/components/NovelCard'
import { Button } from '@/components/ui/button'
import { Loader2, Globe, Lock, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ReadingList() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [list, setList] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!id) return

    Promise.all([
      pb.collection('reading_lists').getOne(id, { expand: 'user' }),
      pb.collection('reading_list_items').getFullList({
        filter: `reading_list = "${id}"`,
        expand: 'novel',
        sort: '-created',
      }),
    ])
      .then(([l, i]) => {
        setList(l)
        setItems(i)
      })
      .catch((err) => {
        console.error(err)
        toast.error('Lista não encontrada ou é privada.')
        navigate('/')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id, navigate])

  const isOwner = user && list?.user === user.id

  const handleVisibilityChange = async (val: string) => {
    if (!isOwner) return
    setIsUpdating(true)
    try {
      const updated = await pb.collection('reading_lists').update(list.id, { visibility: val })
      setList(updated)
      toast.success('Visibilidade atualizada com sucesso.')
    } catch (e) {
      toast.error('Erro ao atualizar visibilidade.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!isOwner) return
    if (!confirm('Tem certeza que deseja excluir esta lista?')) return
    try {
      await pb.collection('reading_lists').delete(list.id)
      toast.success('Lista excluída.')
      navigate(`/profile/${user.id}`)
    } catch (e) {
      toast.error('Erro ao excluir lista.')
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!isOwner) return
    try {
      await pb.collection('reading_list_items').delete(itemId)
      setItems(items.filter((i) => i.id !== itemId))
      toast.success('Obra removida da lista.')
    } catch (e) {
      toast.error('Erro ao remover obra.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-lime-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!list) return null

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 -ml-4 text-zinc-400 hover:text-white hover:bg-zinc-800"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-white">{list.title}</h1>
            {!isOwner &&
              (list.visibility === 'public' ? (
                <Globe className="w-5 h-5 text-zinc-500" />
              ) : (
                <Lock className="w-5 h-5 text-zinc-500" />
              ))}
          </div>
          <p className="text-lg text-zinc-400 mb-4">{list.description}</p>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>
              Criada por{' '}
              <span className="font-semibold text-zinc-200">
                {list.expand?.user?.name || 'Usuário'}
              </span>
            </span>
            <span>•</span>
            <span>{items.length} obras</span>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-3 bg-zinc-900/50 p-3 border border-zinc-800 rounded-xl shrink-0">
            <Select
              value={list.visibility}
              onValueChange={handleVisibilityChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-[150px] bg-transparent border-none shadow-none text-white focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="public" className="focus:bg-zinc-800 cursor-pointer">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" /> Pública
                  </div>
                </SelectItem>
                <SelectItem value="private" className="focus:bg-zinc-800 cursor-pointer">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 mr-2" /> Privada
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="w-px h-6 bg-zinc-800" />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              <NovelCard novel={item.expand?.novel} />
              {isOwner && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full shadow-md bg-red-500 hover:bg-red-600"
                  onClick={(e) => {
                    e.preventDefault()
                    handleRemoveItem(item.id)
                  }}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50">
          <p className="text-zinc-400 text-lg mb-2">Esta lista está vazia.</p>
          {isOwner && (
            <p className="text-sm text-zinc-500">
              Vá até a página de uma obra para adicioná-la aqui.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
