import React, { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RemoveFormatting,
} from 'lucide-react'

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Sync value from props only when not focused to avoid cursor jumping
  useEffect(() => {
    if (editorRef.current && !isFocused && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value, isFocused])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  // Strip all external formatting on paste — keep only plain text structure.
  // Uses execCommand('insertHTML') because it handles the full set of edge
  // cases that manual Range API doesn't (empty editor / no current selection
  // / pasted content inside nested elements). `insertHTML` is deprecated but
  // remains the only cross-browser-reliable contentEditable insertion API.
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()

      // Prefer plain text; fall back to stripping HTML if only HTML is available
      let text = e.clipboardData.getData('text/plain')

      if (!text) {
        const html = e.clipboardData.getData('text/html')
        text = html
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
      }

      // Trim excessive blank lines (3+ consecutive → 2)
      text = text.replace(/\n{3,}/g, '\n\n').trim()
      if (!text) return

      // Build clean HTML with <p> paragraphs and <br> inside.
      // Escape HTML special chars so pasted "<script>" or "&amp;" don't break.
      const escapeHtml = (s: string) =>
        s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')

      const html = text
        .split(/\n\n+/)
        .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
        .join('')

      // Make sure the editor is focused before inserting (handles pasting
      // immediately after clicking the editor without a typed character yet).
      if (editorRef.current && document.activeElement !== editorRef.current) {
        editorRef.current.focus()
      }

      // insertHTML handles selection/cursor placement internally
      document.execCommand('insertHTML', false, html)

      if (editorRef.current) {
        onChange(editorRef.current.innerHTML)
      }
    },
    [onChange],
  )

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg)
    if (editorRef.current) {
      editorRef.current.focus()
      onChange(editorRef.current.innerHTML)
    }
  }

  const isEmpty = !value || value === '<br>' || value === '<p><br></p>'

  return (
    <div className={cn('flex flex-col h-full min-h-0 bg-card', className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/30 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('bold')}
          type="button"
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('italic')}
          type="button"
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('underline')}
          type="button"
          title="Sublinhado"
        >
          <Underline className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('strikeThrough')}
          type="button"
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('formatBlock', 'H1')}
          type="button"
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('formatBlock', 'H2')}
          type="button"
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('formatBlock', 'H3')}
          type="button"
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('insertUnorderedList')}
          type="button"
          title="Lista com Marcadores"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('insertOrderedList')}
          type="button"
          title="Lista Numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('justifyLeft')}
          type="button"
          title="Alinhar à Esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('justifyCenter')}
          type="button"
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('justifyRight')}
          type="button"
          title="Alinhar à Direita"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => execCommand('removeFormat')}
          type="button"
          title="Limpar Formatação"
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 relative min-h-0 bg-card">
        {isEmpty && !isFocused && placeholder && (
          <div className="absolute top-6 left-6 md:top-8 md:left-8 text-muted-foreground/60 pointer-events-none text-base md:text-lg italic">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          className={cn(
            // Layout & scroll
            'absolute inset-0 overflow-y-auto outline-none focus:outline-none',
            // Padding & typography
            'p-6 md:p-10 text-base md:text-lg leading-[1.8] font-serif',
            // Text colour: foreground, but slightly softened in dark mode for long-form reading
            'text-foreground/90',
            // Paragraph spacing inside the editor
            '[&>p]:mb-5 [&>p:last-child]:mb-0',
            // Headings inside the editor
            '[&>h1]:text-3xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-2',
            '[&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mb-3 [&>h2]:mt-6',
            '[&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-4',
            // Lists
            '[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5',
            '[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5',
            // Bulletproof reset: kill any inline styles pasted from external editors
            '[&_*]:!bg-transparent [&_*]:!shadow-none [&_*]:!border-0',
            // Force readable text colour on any pasted span/font tags
            '[&_*]:!text-inherit',
          )}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  )
}
