import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export interface FastPass {
  amount: number
  expires_at: number
}

export interface Wallet {
  coins: number
  fast_passes: FastPass[]
  power_stones: number
  last_checkin: number
  last_vote_reward: number
  exp: number
  level: number
}

export interface Transaction {
  amount: number
  type: 'coin' | 'fast_pass' | 'exp'
  description: string
  created_at: number
}

export interface UnlockedChapter {
  chapter_id: string
  unlocked_at: number
  method: 'coin' | 'fast_pass'
}

export interface Vote {
  novel_id: string
  voted_at: number
}

interface WalletContextType {
  wallet: Wallet
  transactions: Transaction[]
  unlockedChapters: UnlockedChapter[]
  votes: Vote[]
  buyCoins: (amount: number, price: number) => Promise<void>
  addExp: (amount: number, reason: string) => Promise<void>
  voteNovel: (novelId: string) => Promise<boolean>
  unlockChapter: (chapterId: string, method: 'coin' | 'fast_pass', cost: number) => Promise<boolean>
  isChapterUnlocked: (chapterId: string) => boolean
  totalFastPasses: number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const getLevel = (exp: number) => {
  if (exp >= 1000) return 5
  if (exp >= 600) return 4
  if (exp >= 300) return 3
  if (exp >= 100) return 2
  return 1
}

const getDailyStones = (level: number) => {
  if (level >= 5) return 3
  if (level >= 4) return 2
  return 1
}

/**
 * Safely normalise the fast_passes value coming from PocketBase.
 * A brand-new user record may have null / undefined / non-array for this
 * JSON field. Always coerce to a valid FastPass[] before iterating.
 */
const normaliseFastPasses = (raw: unknown): FastPass[] => {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (fp): fp is FastPass =>
      fp !== null &&
      typeof fp === 'object' &&
      typeof (fp as FastPass).amount === 'number' &&
      typeof (fp as FastPass).expires_at === 'number',
  )
}

const defaultWallet: Wallet = {
  coins: 0,
  fast_passes: [],
  power_stones: 1,
  last_checkin: 0,
  last_vote_reward: 0,
  exp: 0,
  level: 1,
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth()

  const wallet: Wallet = user
    ? {
        coins: user.coins || 0,
        fast_passes: normaliseFastPasses(user.fast_passes),
        power_stones: user.power_stones ?? 1,
        last_checkin: user.last_checkin || 0,
        last_vote_reward: user.last_vote_reward || 0,
        exp: user.exp || 0,
        level: user.level || 1,
      }
    : defaultWallet

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('inkrupt_transactions')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [unlockedChapters, setUnlockedChapters] = useState<UnlockedChapter[]>([])

  const [votes, setVotes] = useState<Vote[]>(() => {
    try {
      const saved = localStorage.getItem('inkrupt_votes')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('inkrupt_transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('inkrupt_votes', JSON.stringify(votes))
  }, [votes])

  useEffect(() => {
    if (user) {
      pb.collection('unlocked_chapters')
        .getFullList({
          filter: `user = "${user.id}"`,
        })
        .then((records) => {
          setUnlockedChapters(
            records.map((r) => ({
              chapter_id: r.chapter,
              unlocked_at: new Date(r.created).getTime(),
              method: 'coin',
            })),
          )
        })
        .catch(console.error)
    } else {
      setUnlockedChapters([])
    }
  }, [user?.id])

  const addTransaction = (amount: number, type: Transaction['type'], description: string) => {
    setTransactions((prev) => [{ amount, type, description, created_at: Date.now() }, ...prev])
  }

  const addExp = async (amount: number, reason: string) => {
    if (!user) return
    const newExp = wallet.exp + amount
    const oldLevel = getLevel(wallet.exp)
    const newLevel = getLevel(newExp)

    let newFp = normaliseFastPasses(wallet.fast_passes).filter((fp) => fp.expires_at > Date.now())
    let newStones = wallet.power_stones

    if (newLevel > oldLevel) {
      if (newLevel === 2) newFp.push({ amount: 3, expires_at: Date.now() + 7 * 86400000 })
      if (newLevel === 3) newFp.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
      if (newLevel === 4) {
        newFp.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
        newStones += 1
      }
      if (newLevel === 5) {
        newFp.push({ amount: 10, expires_at: Date.now() + 7 * 86400000 })
        newStones += 2
      }
      setTimeout(() => toast.success(`Parabéns! Você subiu para o Nível ${newLevel}!`), 500)
    }

    try {
      await pb.collection('users').update(user.id, {
        exp: newExp,
        level: newLevel,
        fast_passes: newFp,
        power_stones: newStones,
      })
      addTransaction(amount, 'exp', reason)
    } catch (e) {
      console.error(e)
    }
  }

  // Track which user IDs have had check-in attempted this session so the
  // check-in does NOT re-fire every time authRefresh replaces the user object
  // with a fresh reference (which would change wallet.last_checkin and cause
  // an infinite loop: check-in → authRefresh → new user ref → check-in …).
  const checkinDoneRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user?.id) return
    const today = new Date().setHours(0, 0, 0, 0)
    if (wallet.last_checkin >= today) return          // already checked in today
    if (checkinDoneRef.current.has(user.id)) return   // already attempted this session

    checkinDoneRef.current.add(user.id)

    const currentLevel = getLevel(wallet.exp)
    const dailyStones = getDailyStones(currentLevel)

    const validFps = normaliseFastPasses(wallet.fast_passes).filter(
      (fp) => fp.expires_at > Date.now(),
    )
    const newFp = { amount: 1, expires_at: Date.now() + 7 * 86400000 }

    const newExp = wallet.exp + 10
    const newLevel = getLevel(newExp)

    let nextFps = [...validFps, newFp]
    let nextStones = dailyStones

    if (newLevel > currentLevel) {
      if (newLevel === 2) nextFps.push({ amount: 3, expires_at: Date.now() + 7 * 86400000 })
      if (newLevel === 3) nextFps.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
      if (newLevel === 4) {
        nextFps.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
        nextStones += 1
      }
      if (newLevel === 5) {
        nextFps.push({ amount: 10, expires_at: Date.now() + 7 * 86400000 })
        nextStones += 2
      }
      setTimeout(() => toast.success(`Parabéns! Você subiu para o Nível ${newLevel}!`), 500)
    }

    pb.collection('users')
      .update(user.id, {
        last_checkin: Date.now(),
        power_stones: nextStones,
        fast_passes: nextFps,
        exp: newExp,
        level: newLevel,
      })
      .then(() => {
        addTransaction(1, 'fast_pass', 'Daily Check-in')
        addTransaction(10, 'exp', 'Daily Check-in')
        toast.success('Check-in Diário! +1 Fast Pass, +10 EXP')
      })
      .catch((err) => {
        // Allow retry on next session by removing from done-set
        checkinDoneRef.current.delete(user.id)
        console.error('[check-in] failed:', err)
      })
    // Only re-run when user ID changes (login / logout).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const buyCoins = async (amount: number, price: number) => {
    if (!user) return
    try {
      await pb.collection('users').update(user.id, { coins: wallet.coins + amount })
      addTransaction(amount, 'coin', `Compra de Pacote (R$ ${price.toFixed(2)})`)
      toast.success(`${amount} Coins comprados com sucesso!`)
    } catch (e) {
      console.error(e)
      toast.error('Erro ao comprar coins.')
    }
  }

  const voteNovel = async (novelId: string) => {
    if (!user) {
      toast.error('Faça login para votar.')
      return false
    }
    const today = new Date().setHours(0, 0, 0, 0)
    if (wallet.power_stones <= 0) {
      toast.error('Você não tem mais Power Stones hoje.')
      return false
    }
    if (votes.some((v) => v.novel_id === novelId && v.voted_at > today)) {
      toast.error('Você já votou nesta obra hoje.')
      return false
    }

    let extraFp: FastPass[] = []
    let grantedFp = false
    if (wallet.last_vote_reward < today) {
      extraFp.push({ amount: 1, expires_at: Date.now() + 7 * 86400000 })
      grantedFp = true
    }

    try {
      const newExp = wallet.exp + 5
      const oldLevel = getLevel(wallet.exp)
      const newLevel = getLevel(newExp)

      let nextFps = [
        ...normaliseFastPasses(wallet.fast_passes).filter((fp) => fp.expires_at > Date.now()),
        ...extraFp,
      ]
      let nextStones = wallet.power_stones - 1

      if (newLevel > oldLevel) {
        if (newLevel === 2) nextFps.push({ amount: 3, expires_at: Date.now() + 7 * 86400000 })
        if (newLevel === 3) nextFps.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
        if (newLevel === 4) {
          nextFps.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
          nextStones += 1
        }
        if (newLevel === 5) {
          nextFps.push({ amount: 10, expires_at: Date.now() + 7 * 86400000 })
          nextStones += 2
        }
        setTimeout(() => toast.success(`Parabéns! Você subiu para o Nível ${newLevel}!`), 500)
      }

      await pb.collection('users').update(user.id, {
        power_stones: nextStones,
        last_vote_reward: grantedFp ? Date.now() : wallet.last_vote_reward,
        fast_passes: nextFps,
        exp: newExp,
        level: newLevel,
      })

      if (grantedFp) {
        setTimeout(() => toast.success('Voto registrado! +1 Fast Pass, +5 EXP'), 100)
        addTransaction(1, 'fast_pass', 'Recompensa de Voto')
      } else {
        setTimeout(() => toast.success('Voto registrado! +5 EXP'), 100)
      }

      setVotes((prev) => [{ novel_id: novelId, voted_at: Date.now() }, ...prev])
      addTransaction(5, 'exp', 'Voto com Power Stone')

      pb.send('/backend/v1/vote', {
        method: 'POST',
        body: JSON.stringify({ novel_id: novelId }),
      }).catch(console.error)

      return true
    } catch (e) {
      console.error(e)
      toast.error('Erro ao registrar voto.')
      return false
    }
  }

  const unlockChapter = async (chapterId: string, method: 'coin' | 'fast_pass', cost: number) => {
    if (!user) return false

    try {
      await pb.send('/backend/v1/unlock-chapter', {
        method: 'POST',
        body: JSON.stringify({ chapter_id: chapterId, method }),
      })

      if (method === 'fast_pass') {
        addTransaction(-1, 'fast_pass', `Desbloqueio: Cap ${chapterId}`)
      } else {
        addTransaction(-cost, 'coin', `Desbloqueio: Cap ${chapterId}`)

        const newExp = wallet.exp + 3
        const oldLevel = getLevel(wallet.exp)
        const newLevel = getLevel(newExp)

        let updates: any = { exp: newExp, level: newLevel }

        if (newLevel > oldLevel) {
          let nextFps = normaliseFastPasses(wallet.fast_passes).filter(
            (fp) => fp.expires_at > Date.now(),
          )
          let nextStones = wallet.power_stones

          if (newLevel === 2) nextFps.push({ amount: 3, expires_at: Date.now() + 7 * 86400000 })
          if (newLevel === 3) nextFps.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
          if (newLevel === 4) {
            nextFps.push({ amount: 5, expires_at: Date.now() + 7 * 86400000 })
            nextStones += 1
          }
          if (newLevel === 5) {
            nextFps.push({ amount: 10, expires_at: Date.now() + 7 * 86400000 })
            nextStones += 2
          }
          updates.fast_passes = nextFps
          updates.power_stones = nextStones
          setTimeout(() => toast.success(`Parabéns! Você subiu para o Nível ${newLevel}!`), 500)
        }
        await pb.collection('users').update(user.id, updates)
        addTransaction(3, 'exp', 'Desbloqueio com Coins')
      }

      setUnlockedChapters((prev) => [
        ...prev,
        { chapter_id: chapterId, unlocked_at: Date.now(), method },
      ])

      await pb.collection('users').authRefresh()
      return true
    } catch (err: any) {
      console.error(err)
      return false
    }
  }

  const isChapterUnlocked = (chapterId: string) => {
    return unlockedChapters.some((c) => c.chapter_id === chapterId)
  }

  const totalFastPasses = normaliseFastPasses(wallet.fast_passes)
    .filter((fp) => fp.expires_at > Date.now())
    .reduce((a, b) => a + b.amount, 0)

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        unlockedChapters,
        votes,
        buyCoins,
        addExp,
        voteNovel,
        unlockChapter,
        isChapterUnlocked,
        totalFastPasses,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) throw new Error('useWallet must be used within a WalletProvider')
  return context
}
