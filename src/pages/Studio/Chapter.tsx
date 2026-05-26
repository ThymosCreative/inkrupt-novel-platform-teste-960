import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, ExternalLink, Type, Hash, Lock, Crown, Coins } from 'lucide-react'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { cn } from '@/lib/utils'

type ChapterType = 'free' | 'premium' | 'privilege'
type AuthorTier = 'starter' | 'partner' | 'original'

/**
 * Aggressive HTML sanitiser. Parses the HTML and removes EVERY attribute from
 * EVERY element (style, class, id, dir, lang, bgcolor, etc.), unwraps unknown
 * tags, and strips <font>/<style>/<meta>/<script>/<link>. This guarantees that
 * pasted Google Docs / Word content never carries through visual formatting
 * (white paragraph backgrounds, custom fonts, hard-coded colors).
 * Bold/italic/underline/headings/lists survive because they're carried by
 * tag names, not attributes.
 */
const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'strike',
  'del',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'span',
  'div',
  'a',
])

function sanitizeHtml(html: string): string {
  if (!html) return ''
  if (typeof window === 'undefined' || !window.DOMParser) return html
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walk = (node: Element) => {
    Array.from(node.children).forEach((child) => {
      Array.from(child.attributes).forEach((a) => child.removeAttribute(a.name))
      const tag = child.tagName.toLowerCase()
      if (tag === 'style' || tag === 'meta' || tag === 'script' || tag === 'link') {
        child.remove()
        return
      }
      if (tag === 'font' || !ALLOWED_TAGS.has(tag)) {
        const span = doc.createElement('span')
        span.innerHTML = child.innerHTML
        child.replaceWith(span)
        walk(span)
        return
      }
      walk(child)
    })
  }
  walk(doc.body)
  return doc.body.innerHTML
}

/**
 * Permission rules per author tier:
 *  - starter:  can publish FREE only (no monetisation contract yet)
 *  - partner:  can publish FREE + PREMIUM (50/50 revenue share)
 *  - original: can publish FREE + PREMIUM + PRIVILEGE (curated Inkrupt Original)
 */
const tierCanUseType = (tier: AuthorTier, type: ChapterType): boolean => {
  if (type === 'free') return true
  if (type === 'premium') return tier === 'partner' || tier === 'original'
  if (type === 'privilege') return tier === 'original'
  return false
}

const tierLockReason = (tier: AuthorTier, type: ChapterType): string => {
  if (type === 'premium') {
    return tier === 'starter' ? 'Assine o contrato de monetização para criar capítulos Premium' : ''
  }
  if (type === 'privilege') {
    return tier === 'original'
      ? ''
      : 'Capítulos Privilege são exclusivos para autores Inkrupt Original'
  }
  return ''
}

export default function StudioChapter() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const authorTier: AuthorTier = (user?.author_tier as AuthorTier) || 'starter'

  const [chapter, setChapter] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<{
    title: string
    content: string
    chapter_number: number
    status: string
    type: ChapterType
    coin_price: number
  }>({
    title: '',
    content: '',
    chapter_number: 1,
    status: 'draft',
    type: 'free',
    coin_price: 0,
  })

  useEffect(() => {
    if (!chapterId) return
    pb.collection('chapters')
      .getOne(chapterId, { expand: 'novel' })
      .then((record) => {
        setChapter(record)
        // Migrate legacy is_premium → type if record.type is unset
        const initialType: ChapterType =
          (record.type as ChapterType) || (record.is_premium ? 'premium' : 'free')

        setFormData((prev) => ({
          title: record.title || '',
          content: sanitizeHtml(record.content || '') || prev.content || '',
          chapter_number: record.chapter_number || 1,
          status: record.status || 'draft',
          type: initialType,
          coin_price: record.coin_price || 0,
        }))
      })
      .catch((err) => {
        console.error(err)
        navigate(`/studio/novel/${id}`)
      })
      .finally(() => setLoading(false))
  }, [chapterId, id, navigate])

  const handleSave = async () => {
    if (!chapterId) return

    // Defensive: prevent saving a type the author isn't allowed to use
    if (!tierCanUseType(authorTier, formData.type)) {
      toast({
        title: 'Você não pode salvar este tipo de capítulo',
        description: tierLockReason(authorTier, formData.type),
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    setErrors({})
    try {
      const dataToSave: any = {
        ...formData,
        // Maintain backwards compatibility with legacy is_premium boolean
        is_premium: formData.type === 'premium' || formData.type === 'privilege',
      }
      if (dataToSave.status === 'published' && !chapter?.published_at) {
        dataToSave.published_at = new Date().toISOString()
      }
      const updated = await pb
        .collection('chapters')
        .update(chapterId, dataToSave, { expand: 'novel' })
      setChapter(updated)
      setFormData((prev) => ({
        ...prev,
        title: updated.title || prev.title,
        content: updated.content || prev.content,
        chapter_number: updated.chapter_number || prev.chapter_number,
        status: updated.status || prev.status,
        type: (updated.type as ChapterType) || prev.type,
        coin_price: updated.coin_price || 0,
      }))
      toast({ title: 'Capítulo salvo com sucesso' })
    } catch (err) {
      setErrors(extractFieldErrors(err))
      toast({ title: 'Erro ao salvar capítulo', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-12 text-center">Carregando...</div>

  const textContent = formData.content
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
  const wordCount = textContent ? textContent.split(/\s+/).length : 0
  const charCount = textContent.length

  // ──────────────────────────────────────────────────────────────────────────
  // Segmented type selector
  // ──────────────────────────────────────────────────────────────────────────
  const typeOptions: { value: ChapterType; label: string; icon: typeof Coins }[] = [
    { value: 'free', label: 'Grátis', icon: Type },
    { value: 'premium', label: 'Premium', icon: Coins },
    { value: 'privilege', label: 'Privilege', icon: Crown },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex flex-col h-[calc(100vh-4rem)] relative">
      <div className="flex items-center gap-4 mb-6 shrink-0 flex-wrap bg-background/95 backdrop-blur z-10 sticky top-0 py-2 border-b">
        <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
          <Link to={`/studio/novel/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1 flex flex-col min-w-[200px]">
          <div className="text-xs text-muted-foreground font-medium mb-1 line-clamp-1">
            {chapter?.expand?.novel?.title} • Capítulo {formData.chapter_number}
          </div>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-xl font-bold border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto py-0"
            placeholder="Título do Capítulo"
          />
        </div>

        {/* Segmented chapter type selector — tier-gated */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border shrink-0">
          {typeOptions.map((opt) => {
            const allowed = tierCanUseType(authorTier, opt.value)
            const selected = formData.type === opt.value
            const reason = tierLockReason(authorTier, opt.value)
            const Icon = opt.icon
            return (
              <button
                key={opt.value}
                type="button"
                disabled={!allowed}
                title={!allowed ? reason : ''}
                onClick={() => allowed && setFormData({ ...formData, type: opt.value })}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selected
                    ? opt.value === 'privilege'
                      ? 'bg-violet-500 text-white shadow-sm'
                      : opt.value === 'premium'
                        ? 'bg-amber-500 text-black shadow-sm'
                        : 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                  !allowed && 'opacity-40 cursor-not-allowed hover:text-muted-foreground',
                )}
              >
                {!allowed ? <Lock className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Coin price input — only shown for premium */}
        {formData.type === 'premium' && (
          <div className="flex items-center gap-2 bg-amber-500/5 px-3 py-2 rounded-xl border border-amber-500/20 shrink-0">
            <Label htmlFor="coin-price" className="text-xs text-amber-500 font-medium">
              Coins
            </Label>
            <Input
              id="coin-price"
              type="number"
              value={formData.coin_price}
              onChange={(e) =>
                setFormData({ ...formData, coin_price: parseInt(e.target.value) || 0 })
              }
              className="w-20 h-7 text-xs bg-background"
              min="0"
            />
          </div>
        )}

        <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl border shrink-0">
          <Label htmlFor="publish-mode" className="text-sm font-medium cursor-pointer">
            Publicado
          </Label>
          <Switch
            id="publish-mode"
            checked={formData.status === 'published'}
            onCheckedChange={(c) => setFormData({ ...formData, status: c ? 'published' : 'draft' })}
          />
        </div>

        <Button variant="outline" asChild className="rounded-xl hidden sm:flex gap-2 shrink-0">
          <Link to={`/novel/${id}/chapter/${formData.chapter_number}`}>
            <ExternalLink className="w-4 h-4" /> Ler
          </Link>
        </Button>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 shrink-0">
          <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {/* Tier upgrade hint — only shown when current tier is below what could unlock more */}
      {authorTier === 'starter' && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm flex items-center gap-2 shrink-0">
          <Lock className="w-4 h-4 shrink-0" />
          <span>
            Você ainda não pode publicar capítulos pagos. Assine o contrato de monetização para
            desbloquear o Premium.
          </span>
        </div>
      )}

      {errors.title && <p className="text-sm text-destructive mb-4 shrink-0">{errors.title}</p>}
      {errors.status && <p className="text-sm text-destructive mb-4 shrink-0">{errors.status}</p>}

      <div className="flex-1 flex flex-col min-h-0 bg-card border rounded-2xl overflow-hidden shadow-sm">
        <RichTextEditor
          value={formData.content}
          onChange={(val) => setFormData({ ...formData, content: val })}
          className="flex-1 border-0 rounded-none h-full"
          placeholder="Escreva seu capítulo aqui..."
        />
      </div>
      {errors.content && <p className="text-sm text-destructive mt-2 shrink-0">{errors.content}</p>}

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground shrink-0 border-t pt-4">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <Type className="w-4 h-4" /> {wordCount} palavras
          </span>
          <span className="flex items-center gap-1.5">
            <Hash className="w-4 h-4" /> {charCount} caracteres
          </span>
        </div>
        <div>
          Última alteração:{' '}
          {chapter?.updated ? new Date(chapter.updated).toLocaleString() : 'Não salvo'}
        </div>
      </div>
    </div>
  )
}
