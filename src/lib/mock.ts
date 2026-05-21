export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  content: string
}

export interface Chapter {
  id: string
  title: string
  content: string
  isPremium: boolean
  publishedAt: string
}

export interface Novel {
  id: string
  title: string
  author: string
  synopsis: string
  coverUrl: string
  genres: string[]
  isOriginal: boolean
  isHot: boolean
  status: 'Em Andamento' | 'Concluído'
  reads: number
  votes: number
  chapters: Chapter[]
  reviews: Review[]
}

const genres = ['Fantasia', 'Romance', 'Ficção Científica', 'Xianxia', 'Ação', 'Mistério']

export const mockNovels: Novel[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `n${i + 1}`,
  title: `A Lenda do Caos ${i + 1}`,
  author: `Mestre das Palavras ${(i % 5) + 1}`,
  synopsis: `Uma história épica de superação onde o herói descobre um poder oculto que mudará o destino de todo o universo. Cheio de batalhas intensas, romance e mistérios profundos que desafiam a própria realidade.`,
  coverUrl: `https://img.usecurling.com/p/300/400?q=fantasy,epic&seed=${i + 1}`,
  genres: [genres[i % genres.length], genres[(i + 1) % genres.length]],
  isOriginal: i % 3 === 0,
  isHot: i < 3,
  status: i % 4 === 0 ? 'Concluído' : 'Em Andamento',
  reads: Math.floor(Math.random() * 5000000) + 10000,
  votes: Math.floor(Math.random() * 50000) + 100,
  chapters: Array.from({ length: 5 }).map((_, j) => ({
    id: `c${j + 1}`,
    title: `Capítulo ${j + 1}: O Despertar`,
    content: `O sol não brilhava como antes. O céu estava coberto por uma névoa espessa e escura, anunciando a chegada de uma nova era. Ele olhou para suas mãos, sentindo o poder fluir por suas veias.\n\n"Isx é apenas o começo", murmurou para si mesmo.\n\nA verdadeira jornada ainda estava por vir, e ele sabia que muitos sacrifícios seriam necessários.`,
    isPremium: j >= 3,
    publishedAt: new Date(Date.now() - j * 86400000).toISOString(),
  })),
  reviews: Array.from({ length: 3 }).map((_, k) => ({
    id: `r${k + 1}`,
    userId: `u${k + 1}`,
    userName: `LeitorÁvido${k + 1}`,
    rating: 4 + Math.random(),
    content: `Uma das melhores histórias que já li neste site! O desenvolvimento dos personagens é simplesmente espetacular.`,
  })),
}))

export const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
