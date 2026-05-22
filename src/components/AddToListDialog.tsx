import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Loader2, Plus, Lock, Globe } from 'lucide-react'

interface AddToListDialogProps {
  novelId: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AddToListDialog({ novelId, isOpen, onOpenChange }: AddToListDialogProps) {
  const { user } = useAuth()
  const [lists, setLists] = useState<any[]>([])
  const [checkedLists, setCheckedLists] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const [showNewList, setShowNewList] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!isOpen || !user) return
    setLoading(true)

    Promise.all([
      pb
        .collection('reading_lists')
        .getFullList({ filter: `user = "${user.id}"`, sort: '-created' }),
      pb
        .collection('reading_list_items')
        .getFullList({ filter: `novel = "${novelId}" && reading_list.user = "${user.id}"` }),
    ])
      .then(([userLists, existingItems]) => {
        setLists(userLists)
        const set = new Set<string>()
        existingItems.forEach((i) => set.add(i.reading_list))
        setCheckedLists(set)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isOpen, user, novelId])

  const toggleList = async (listId: string) => {
    if (!user) return
    setIsProcessing(listId)

    try {
      if (checkedLists.has(listId)) {
        const items = await pb.collection('reading_list_items').getFullList({
          filter: `reading_list = "${listId}" && novel = "${novelId}"`,
        })
        for (const item of items) {
          await pb.collection('reading_list_items').delete(item.id)
        }
        const next = new Set(checkedLists)
        next.delete(listId)
        setCheckedLists(next)
        toast.success('Obra removida da lista.')
      } else {
        await pb.collection('reading_list_items').create({
          reading_list: listId,
          novel: novelId,
        })
        const next = new Set(checkedLists)
        next.add(listId)
        setCheckedLists(next)
        toast.success('Obra adicionada à lista.')
      }
    } catch (e) {
      toast.error('Erro ao atualizar lista.')
    } finally {
      setIsProcessing(null)
    }
  }

  const handleCreateList = async () => {
    if (!newTitle.trim()) return
    setIsCreating(true)
    try {
      const newList = await pb.collection('reading_lists').create({
        user: user?.id,
        title: newTitle.trim(),
        visibility: 'public',
      })
      setLists([newList, ...lists])

      await pb.collection('reading_list_items').create({
        reading_list: newList.id,
        novel: novelId,
      })
      const next = new Set(checkedLists)
      next.add(newList.id)
      setCheckedLists(next)

      setNewTitle('')
      setShowNewList(false)
      toast.success('Lista criada e obra adicionada!')
    } catch (e) {
      toast.error('Erro ao criar lista.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Salvar em uma Lista</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Adicione esta obra às suas listas de leitura personalizadas.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-lime-400" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {lists.map((list) => (
                <div
                  key={list.id}
                  className="flex items-center space-x-3 p-2 hover:bg-zinc-900 rounded-lg transition-colors"
                >
                  <Checkbox
                    id={`list-${list.id}`}
                    checked={checkedLists.has(list.id)}
                    disabled={isProcessing === list.id}
                    onCheckedChange={() => toggleList(list.id)}
                    className="data-[state=checked]:bg-lime-400 data-[state=checked]:text-black border-zinc-600"
                  />
                  <label
                    htmlFor={`list-${list.id}`}
                    className="flex-1 flex items-center justify-between cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-200"
                  >
                    <span className="truncate pr-4">{list.title}</span>
                    {list.visibility === 'public' ? (
                      <Globe className="w-3 h-3 text-zinc-500 shrink-0" />
                    ) : (
                      <Lock className="w-3 h-3 text-zinc-500 shrink-0" />
                    )}
                  </label>
                  {isProcessing === list.id && (
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                  )}
                </div>
              ))}

              {lists.length === 0 && !showNewList && (
                <p className="text-center text-sm text-zinc-500 py-4">
                  Você ainda não tem nenhuma lista.
                </p>
              )}
            </div>
          )}

          {!loading &&
            (showNewList ? (
              <div className="flex items-center gap-2 mt-4">
                <Input
                  placeholder="Nome da nova lista"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-lime-400"
                />
                <Button
                  onClick={handleCreateList}
                  disabled={!newTitle.trim() || isCreating}
                  className="bg-lime-400 text-black hover:bg-lime-500 shrink-0 font-bold"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Criar'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewList(false)}
                  className="shrink-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  X
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full mt-4 border-dashed border-2 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white"
                onClick={() => setShowNewList(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Nova Lista
              </Button>
            ))}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-zinc-800 hover:text-white"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
