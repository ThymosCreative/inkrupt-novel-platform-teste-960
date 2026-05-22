import { useWallet } from '@/hooks/use-wallet'
import { Coins, Zap, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Store() {
  const { wallet, transactions, totalFastPasses, buyCoins } = useWallet()

  const packages = [
    { amount: 50, price: 4.9 },
    { amount: 150, price: 12.9 },
    { amount: 350, price: 24.9 },
    { amount: 750, price: 44.9, featured: true },
    { amount: 1500, price: 79.9 },
  ]

  const nextExpiry = wallet.fast_passes
    .filter((fp) => fp.expires_at > Date.now())
    .sort((a, b) => a.expires_at - b.expires_at)[0]

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <h1 className="text-3xl font-black mb-8 text-foreground">Inkrupt Store</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" /> Comprar Coins
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.amount}
                className={`relative p-6 rounded-2xl border ${pkg.featured ? 'border-lime-400 bg-lime-400/5' : 'border-border bg-card'} flex items-center justify-between`}
              >
                {pkg.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Mais Popular
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                    <Coins className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="font-black text-xl">{pkg.amount}</div>
                </div>
                <Button
                  onClick={() => buyCoins(pkg.amount, pkg.price)}
                  variant={pkg.featured ? 'default' : 'outline'}
                  className={
                    pkg.featured ? 'bg-lime-400 text-black hover:bg-lime-500 font-bold' : ''
                  }
                >
                  R$ {pkg.price.toFixed(2).replace('.', ',')}
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" /> Meus Recursos
          </h2>
          <div className="bg-card border rounded-2xl p-6 space-y-6">
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Coins Disponíveis
              </div>
              <div className="text-3xl font-black text-amber-500 flex items-center gap-2">
                <Coins className="w-6 h-6" /> {wallet.coins}
              </div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1 flex items-center justify-between">
                Fast Passes
                {nextExpiry && (
                  <span className="text-[10px] flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3" /> Expira em{' '}
                    {Math.ceil((nextExpiry.expires_at - Date.now()) / 86400000)}d
                  </span>
                )}
              </div>
              <div className="text-3xl font-black text-blue-500 flex items-center gap-2">
                <Zap className="w-6 h-6" /> {totalFastPasses}
              </div>
            </div>
            <div className="h-px bg-border" />
            <div>
              <div className="text-sm font-medium text-muted-foreground mb-1">
                Power Stones (Hoje)
              </div>
              <div className="text-3xl font-black text-purple-500 flex items-center gap-2">
                <Star className="w-6 h-6" /> {wallet.power_stones}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Histórico de Transações</h2>
        <div className="bg-card border rounded-2xl overflow-hidden">
          {transactions.length > 0 ? (
            <div className="divide-y">
              {transactions.slice(0, 30).map((t, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm sm:text-base">{t.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`font-bold flex items-center gap-1 ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}
                  >
                    {t.amount > 0 ? '+' : ''}
                    {t.amount}
                    {t.type === 'coin' && <Coins className="w-4 h-4" />}
                    {t.type === 'fast_pass' && <Zap className="w-4 h-4" />}
                    {t.type === 'exp' && <span className="text-xs ml-1">EXP</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma transação encontrada.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
