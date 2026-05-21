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

export const getHotNovels = async () => {
  return pb.collection('novels').getList(1, 5, {
    filter: 'is_hot = true',
    expand: 'author',
    sort: '-reads',
  })
}

export const getTrendingNovels = async () => {
  return pb.collection('novels').getList(1, 12, {
    expand: 'author',
    sort: '-reads',
  })
}

export interface SearchOptions {
  query?: string
  status?: string
  type?: string
  sort?: string
  limit?: number
}

export const searchNovels = async (options: SearchOptions = {}) => {
  const { query = '', status, type, sort = '-reads', limit = 20 } = options

  let filterStr = ''
  const filters = []
  if (status && status !== 'all') filters.push(`status = "${status}"`)
  if (type && type !== 'all') filters.push(`type = "${type}"`)

  if (filters.length > 0) filterStr = filters.join(' && ')

  if (query) {
    try {
      const res = await pb.send('/backend/v1/search', {
        method: 'POST',
        body: JSON.stringify({ query, filter: filterStr, k: limit, sort }),
      })
      return { items: res.items || [] }
    } catch (err) {
      console.error(err)
      return { items: [] }
    }
  }

  return pb.collection('novels').getList(1, limit, {
    filter: filterStr,
    sort: sort === 'semantic' ? '-reads' : sort,
    expand: 'author',
  })
}

export const getComments = async (chapterId: string) => {
  return pb
    .collection('comments')
    .getFullList({ filter: `chapter = "${chapterId}"`, expand: 'user', sort: '-created' })
}

export const createComment = async (chapterId: string, content: string, userId: string) => {
  return pb.collection('comments').create({ chapter: chapterId, content, user: userId })
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
    .getFullList({ filter: `user = "${userId}"`, expand: 'novel,last_chapter', sort: '-updated' })
}
