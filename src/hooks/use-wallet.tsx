import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'
import { sendVoteToBackend } from '@/services/api'

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
  buyCoins: (amount: number, price: number) => void
  addExp: (amount: number, reason: string) => void
  voteNovel: (novelId: string) => boolean
  unlockChapter: (chapterId: string, method: 'coin' | 'fast_pass', cost: number) => boolean
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
  if (level >= 3) return 2
  return 1
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
  const [wallet, setWallet] = useState<Wallet>(() => {
    const saved = localStorage.getItem('inkrupt_wallet')
    return saved ? JSON.parse(saved) : defaultWallet
  })

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('inkrupt_transactions')
    return saved ? JSON.parse(saved) : []
  })

  const [unlockedChapters, setUnlockedChapters] = useState<UnlockedChapter[]>(() => {
    const saved = localStorage.getItem('inkrupt_unlocked')
    return saved ? JSON.parse(saved) : []
  })

  const [votes, setVotes] = useState<Vote[]>(() => {
    const saved = localStorage.getItem('inkrupt_votes')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('inkrupt_wallet', JSON.stringify(wallet))
  }, [wallet])

  useEffect(() => {
    localStorage.setItem('inkrupt_transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('inkrupt_unlocked', JSON.stringify(unlockedChapters))
  }, [unlockedChapters])

  useEffect(() => {
    localStorage.setItem('inkrupt_votes', JSON.stringify(votes))
  }, [votes])

  const addTransaction = (amount: number, type: Transaction['type'], description: string) => {
    setTransactions((prev) => [{ amount, type, description, created_at: Date.now() }, ...prev])
  }

  const addExp = (amount: number, reason: string) => {
    setWallet((prev) => {
      const newExp = prev.exp + amount
      const oldLevel = getLevel(prev.exp)
      const newLevel = getLevel(newExp)

      let newFp = [...prev.fast_passes.filter((fp) => fp.expires_at > Date.now())]
      let newStones = prev.power_stones

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

      return { ...prev, exp: newExp, level: newLevel, fast_passes: newFp, power_stones: newStones }
    })
    addTransaction(amount, 'exp', reason)
  }

  useEffect(() => {
    const today = new Date().setHours(0, 0, 0, 0)
    if (wallet.last_checkin < today) {
      setWallet((prev) => {
        const level = getLevel(prev.exp)
        const dailyStones = getDailyStones(level)
        const validFps = prev.fast_passes.filter((fp) => fp.expires_at > Date.now())
        const newFp = { amount: 1, expires_at: Date.now() + 7 * 86400000 }
        return {
          ...prev,
          last_checkin: Date.now(),
          power_stones: dailyStones,
          fast_passes: [...validFps, newFp],
        }
      })
      addTransaction(1, 'fast_pass', 'Daily Check-in')
      addExp(10, 'Daily Check-in')
      toast.success('Check-in Diário! +1 Fast Pass, +10 EXP')
    }
  }, [wallet.last_checkin])

  const buyCoins = (amount: number, price: number) => {
    setWallet((prev) => ({ ...prev, coins: prev.coins + amount }))
    addTransaction(amount, 'coin', `Compra de Pacote (R$ ${price.toFixed(2)})`)
    toast.success(`${amount} Coins comprados com sucesso!`)
  }

  const voteNovel = (novelId: string) => {
    if (wallet.power_stones <= 0) return false

    setWallet((prev) => {
      let extraFp: FastPass[] = []
      const today = new Date().setHours(0, 0, 0, 0)
      let grantedFp = false
      if (prev.last_vote_reward < today) {
        extraFp.push({ amount: 1, expires_at: Date.now() + 7 * 86400000 })
        grantedFp = true
      }

      if (grantedFp) {
        toast.success('Voto registrado! +1 Fast Pass, +5 EXP')
        addTransaction(1, 'fast_pass', 'Recompensa de Voto')
      } else {
        toast.success('Voto registrado! +5 EXP')
      }

      return {
        ...prev,
        power_stones: prev.power_stones - 1,
        last_vote_reward: grantedFp ? Date.now() : prev.last_vote_reward,
        fast_passes: [...prev.fast_passes.filter((fp) => fp.expires_at > Date.now()), ...extraFp],
      }
    })

    setVotes((prev) => [{ novel_id: novelId, voted_at: Date.now() }, ...prev])
    addExp(5, 'Voto com Power Stone')
    sendVoteToBackend(novelId).catch(console.error)
    return true
  }

  const unlockChapter = (chapterId: string, method: 'coin' | 'fast_pass', cost: number) => {
    if (method === 'fast_pass') {
      let activeFps = wallet.fast_passes.filter((fp) => fp.expires_at > Date.now())
      const total = activeFps.reduce((a, b) => a + b.amount, 0)
      if (total < 1) return false

      activeFps.sort((a, b) => a.expires_at - b.expires_at)
      activeFps[0].amount -= 1
      const newFp = activeFps.filter((fp) => fp.amount > 0)

      setWallet((prev) => ({ ...prev, fast_passes: newFp }))
      addTransaction(-1, 'fast_pass', `Desbloqueio: Cap ${chapterId}`)
    } else {
      if (wallet.coins < cost) return false
      setWallet((prev) => ({ ...prev, coins: prev.coins - cost }))
      addTransaction(-cost, 'coin', `Desbloqueio: Cap ${chapterId}`)
      addExp(3, 'Desbloqueio com Coins')
    }

    setUnlockedChapters((prev) => [
      ...prev,
      { chapter_id: chapterId, unlocked_at: Date.now(), method },
    ])
    return true
  }

  const isChapterUnlocked = (chapterId: string) => {
    return unlockedChapters.some((c) => c.chapter_id === chapterId)
  }

  const totalFastPasses = wallet.fast_passes
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
