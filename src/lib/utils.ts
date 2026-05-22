import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getChapterCost(chapter: any) {
  const words = chapter.content ? chapter.content.split(/\s+/).length : 0
  const cost = Math.ceil(words / 200) || 1
  const type = chapter.coin_price ? 'privilege' : chapter.is_premium ? 'premium' : 'free'
  return { type, cost: chapter.coin_price || (type !== 'free' ? cost : 0) }
}

export async function captureElementAsDataURL(element: HTMLElement): Promise<string> {
  const clone = element.cloneNode(true) as HTMLElement
  let cssText = ''

  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i]
    try {
      const rules = sheet.cssRules || sheet.rules
      if (rules) {
        for (let j = 0; j < rules.length; j++) {
          cssText += rules[j].cssText
        }
      }
    } catch (e: any) {
      if (e.name === 'SecurityError' || e.message?.includes('SecurityError')) {
        console.warn(`Skipped cross-origin stylesheet: ${sheet.href}`)
        continue
      }
      console.error('Error reading stylesheet', e)
    }
  }

  const style = document.createElement('style')
  style.textContent = cssText
  clone.insertBefore(style, clone.firstChild)

  clone.style.margin = '0'
  clone.style.transform = 'none'

  const xmlSerializer = new XMLSerializer()
  const xml = xmlSerializer.serializeToString(clone)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${element.offsetWidth}" height="${element.offsetHeight}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">
        ${xml}
      </div>
    </foreignObject>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
