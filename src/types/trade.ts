export type Direction = 'Long' | 'Short'
export type View = 'dashboard' | 'trades' | 'statistics' | 'calendar' | 'trading-plan'

export type Trade = {
  id: string
  user_id: string
  created_at: string
  trade_date: string
  instrument: string
  direction: Direction
  entry_price: number | null
  stop_loss: number | null
  take_profit: number | null
  exit_price: number | null
  position_size: number | null
  commission: number
  pnl: number
  r_multiple: number | null
  setup: string | null
  notes: string | null
}

export type TradeForm = {
  trade_date: string
  instrument: string
  direction: Direction
  entry_price: string
  stop_loss: string
  take_profit: string
  exit_price: string
  position_size: string
  commission: string
  setup: string
  notes: string
}

export type Stats = {
  pnl: number
  wins: number
  losses: number
  winrate: number
  profitFactor: number | null
  avgR: number | null
}
