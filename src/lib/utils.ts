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
