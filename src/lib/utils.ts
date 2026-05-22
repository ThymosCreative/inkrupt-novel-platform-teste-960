import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getChapterCost = (chap: any) => {
  if (!chap.is_premium) return { type: 'free', cost: 0 }
  const wordCount = chap.content
    ? chap.content.split(/\s+/).length
    : chap.chapter_number * 50 + 1500
  const cost = chap.coin_price || Math.ceil(wordCount / 200)
  const isPrivilege = chap.chapter_number % 5 === 0
  return { type: isPrivilege ? 'privilege' : 'premium', cost }
}
