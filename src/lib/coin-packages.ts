// Coin purchase packages — frontend definition.
//
// This list MUST stay in sync with the PACKAGES table inside
// pocketbase/hooks/purchase_coins.js. The backend validates the package_id
// the frontend sends and reads coins/price from its OWN copy of this list
// (so the client can't tamper with prices).
//
// Pricing in cents (BRL) to avoid floating-point math on money.

export interface CoinPackage {
  /** Stable identifier sent to the backend (`package_id`). */
  id: string
  /** Coins credited on a successful purchase. */
  coins: number
  /** Price in BRL cents. R$ 25,00 → 2500. */
  price_brl_cents: number
  /** Visual highlight on the Store page. */
  featured?: boolean
  /** Bonus % vs the base rate of the smallest package — for the UI to show. */
  bonus_pct?: number
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'p60',    coins: 60,    price_brl_cents: 500 },
  { id: 'p300',   coins: 300,   price_brl_cents: 2500 },
  { id: 'p680',   coins: 680,   price_brl_cents: 5000,  bonus_pct: 13 },
  { id: 'p1280',  coins: 1280,  price_brl_cents: 10000, bonus_pct: 28, featured: true },
  { id: 'p3280',  coins: 3280,  price_brl_cents: 25000, bonus_pct: 31 },
  { id: 'p6480',  coins: 6480,  price_brl_cents: 50000, bonus_pct: 30 },
]

/** Helper to display "R$ 25,00" given cents. */
export const formatBRL = (cents: number): string => {
  const reais = cents / 100
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
