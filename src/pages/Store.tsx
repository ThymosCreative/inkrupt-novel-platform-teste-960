import { useState } from 'react'
import { useWallet } from '@/hooks/use-wallet'
import { Coins, Zap, Star, Clock, Loader2, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { COIN_PACKAGES, formatBRL, type CoinPackage } from '@/lib/coin-packages'
import { cn } from '@/lib/utils'

export default function Store() {
  const { wallet, transactions, totalFastPasses, buyCoins } = useWallet()
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  const nextExpiry = wallet.fast_passes
    .filter((fp) => fp.expires_at > Date.now())
    .sort((a, b) => a.expires_at - b.expires_at)[0]

  const featured = COIN_PACKAGES.find((p) => p.featured)
  const regular = COIN_PACKAGES.filter((p) => !p.featured)

  const handleBuy = async (pkg: CoinPackage) => {
    setPurchasingId(pkg.id)
    try {
      await buyCoins(pkg.id)
    } finally {
      setPurchasingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-zinc-950">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* ─────────────────────── PAGE HEADER ─────────────────────── */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-amber-400 via-lime-400 to-amber-400 bg-clip-text text-transparent">
            Inkrupt Store
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Recarregue sua carteira para desbloquear capítulos premium das suas obras favoritas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─────────────────────── LEFT: PACKAGES ─────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured package (hero card) */}
            {featured && (
              <FeaturedPackageCard
                pkg={featured}
                busy={purchasingId === featured.id}
                onBuy={() => handleBuy(featured)}
              />
            )}

            {/* Regular packages grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {regular.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  busy={purchasingId === pkg.id}
                  onBuy={() => handleBuy(pkg)}
                />
              ))}
            </div>

            {/* Simulation notice */}
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p>
                Pagamento em <strong className="text-amber-500">modo de simulação</strong> durante o
                desenvolvimento. Coins são creditadas instantaneamente sem cobrança real. Integração
                com Mercado Pago / Stripe chega na próxima fase.
              </p>
            </div>
          </div>

          {/* ─────────────────────── RIGHT: WALLET SUMMARY ─────────────────────── */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold">Meu Saldo</h2>
              </div>

              <ResourceRow
                icon={<Coins className="w-5 h-5" />}
                color="amber"
                label="Coins"
                value={wallet.coins.toLocaleString('pt-BR')}
              />

              <div className="h-px bg-zinc-800 my-5" />

              <ResourceRow
                icon={<Zap className="w-5 h-5" />}
                color="sky"
                label="Fast Passes"
                value={totalFastPasses.toString()}
                badge={
                  nextExpiry && (
                    <span className="text-[10px] flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Expira em{' '}
                      {Math.ceil((nextExpiry.expires_at - Date.now()) / 86400000)}d
                    </span>
                  )
                }
              />

              <div className="h-px bg-zinc-800 my-5" />

              <ResourceRow
                icon={<Star className="w-5 h-5" />}
                color="violet"
                label="Power Stones"
                value={wallet.power_stones.toString()}
                hint="(hoje)"
              />
            </div>
          </div>
        </div>

        {/* ─────────────────────── TRANSACTIONS ─────────────────────── */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-xl font-bold">Histórico de Transações</h2>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            {transactions.length > 0 ? (
              <div className="divide-y divide-zinc-800/60">
                {transactions.slice(0, 30).map((t, idx) => (
                  <div
                    key={t.id ?? idx}
                    className="px-5 py-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">
                        {t.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(t.created_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <div
                      className={cn(
                        'font-bold flex items-center gap-1.5 shrink-0 ml-4 text-sm sm:text-base',
                        t.amount > 0 ? 'text-emerald-400' : 'text-rose-400',
                      )}
                    >
                      <span>
                        {t.amount > 0 ? '+' : ''}
                        {t.amount}
                      </span>
                      {t.type === 'coin' && <Coins className="w-4 h-4" />}
                      {t.type === 'fast_pass' && <Zap className="w-4 h-4" />}
                      {t.type === 'exp' && (
                        <span className="text-[10px] font-black tracking-wider">EXP</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <Coins className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Você ainda não tem nenhuma transação.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface PackageCardProps {
  pkg: CoinPackage
  busy: boolean
  onBuy: () => void
}

function FeaturedPackageCard({ pkg, busy, onBuy }: PackageCardProps) {
  return (
    <div className="relative group">
      {/* Outer glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-lime-400 to-amber-500 rounded-3xl blur opacity-40 group-hover:opacity-70 transition duration-500" />

      <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-950/30 border border-lime-400/40 rounded-3xl p-6 md:p-8 overflow-hidden">
        {/* "Most popular" ribbon */}
        <div className="absolute top-0 right-0 bg-lime-400 text-black text-[10px] font-black px-4 py-1 rounded-bl-2xl tracking-widest uppercase">
          ⭐ Mais Popular
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4 sm:mt-0">
          {/* Coin visual */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-2xl" />
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Coins className="w-10 h-10 md:w-12 md:h-12 text-amber-950" strokeWidth={2.5} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-4xl md:text-5xl font-black text-white leading-none">
              {pkg.coins.toLocaleString('pt-BR')}
            </div>
            <div className="text-sm font-medium text-zinc-400 mt-1">Coins</div>
            {pkg.bonus_pct ? (
              <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-lime-400/15 border border-lime-400/30 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span className="text-xs font-bold text-lime-400">
                  +{pkg.bonus_pct}% bônus incluso
                </span>
              </div>
            ) : null}
          </div>

          {/* Buy button */}
          <Button
            onClick={onBuy}
            disabled={busy}
            size="lg"
            className="w-full sm:w-auto bg-lime-400 text-black hover:bg-lime-300 font-black text-base px-8 h-14 shadow-lg shadow-lime-400/20"
          >
            {busy ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>{formatBRL(pkg.price_brl_cents)}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function PackageCard({ pkg, busy, onBuy }: PackageCardProps) {
  const hasBonus = (pkg.bonus_pct ?? 0) > 0

  return (
    <div
      className={cn(
        'relative rounded-2xl border p-5 flex items-center justify-between transition-all hover:translate-y-[-2px] hover:shadow-xl',
        hasBonus
          ? 'border-lime-400/20 bg-gradient-to-br from-zinc-900 to-lime-950/20 hover:border-lime-400/40'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700',
      )}
    >
      {/* Bonus ribbon */}
      {hasBonus && (
        <div className="absolute -top-2 -right-2 bg-lime-400 text-black text-[10px] font-black px-2 py-0.5 rounded-md shadow-md">
          +{pkg.bonus_pct}%
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Coins className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <div className="font-black text-xl leading-tight">
            {pkg.coins.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-muted-foreground font-medium">Coins</div>
        </div>
      </div>

      <Button
        onClick={onBuy}
        disabled={busy}
        className="bg-lime-400 text-black hover:bg-lime-300 font-bold min-w-[100px]"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : formatBRL(pkg.price_brl_cents)}
      </Button>
    </div>
  )
}

interface ResourceRowProps {
  icon: React.ReactNode
  color: 'amber' | 'sky' | 'violet'
  label: string
  value: string
  hint?: string
  badge?: React.ReactNode
}

function ResourceRow({ icon, color, label, value, hint, badge }: ResourceRowProps) {
  const colorMap = {
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-400',
    },
    sky: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      text: 'text-sky-400',
    },
    violet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      text: 'text-violet-400',
    },
  }[color]

  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border',
          colorMap.bg,
          colorMap.border,
          colorMap.text,
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground flex items-center gap-2 mb-1">
          <span>{label}</span>
          {hint && <span className="text-zinc-600">{hint}</span>}
          {badge}
        </div>
        <div className={cn('text-2xl font-black', colorMap.text)}>{value}</div>
      </div>
    </div>
  )
}
