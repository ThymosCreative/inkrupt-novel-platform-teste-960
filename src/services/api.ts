import pb from '@/lib/pocketbase/client'

export const formatNumber = (num: number) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export const getCoverUrl = (novel: any) => {
  if (novel.cover) return pb.files.getURL(novel, novel.cover)
  return `https://img.usecurling.com/p/300/400?q=fantasy,epic&seed=${novel.id}`
}

export const getNovels = async (options: any = {}) => {
  return pb.collection('novels').getList(1, 50, { expand: 'author', ...options })
}

export const getNovel = async (id: string) => {
  return pb.collection('novels').getOne(id, { expand: 'author' })
}

export const getChapters = async (novelId: string) => {
  return pb
    .collection('chapters')
    .getFullList({ filter: `novel = "${novelId}"`, sort: 'chapter_number' })
}

export const getChapterByNum = async (novelId: string, num: number) => {
  return pb
    .collection('chapters')
    .getFirstListItem(`novel = "${novelId}" && chapter_number = ${num}`)
}

export const getReviews = async (novelId: string) => {
  return pb
    .collection('reviews')
    .getFullList({ filter: `novel = "${novelId}"`, expand: 'user', sort: '-created' })
}

export const getLibrary = async (userId: string) => {
  return pb
    .collection('library_entries')
    .getFullList({ filter: `user = "${userId}"`, expand: 'novel', sort: '-updated' })
}
