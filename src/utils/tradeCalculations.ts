import type { Direction, Trade, TradeForm } from '../types/trade'

export const numberOrNull = (value: string) => value.trim() === '' ? null : Number(value)

export function calculateTrade(entry: number | null, stop: number | null, exit: number | null, size: number | null, commission: number, direction: Direction) {
  const sign = direction === 'Long' ? 1 : -1
  const grossPnl = entry !== null && exit !== null && size !== null ? (exit - entry) * sign * size : null
  const pnl = grossPnl === null ? null : grossPnl - commission
  const riskPerUnit = entry !== null && stop !== null ? Math.abs(entry - stop) : null
  const rewardPerUnit = entry !== null && exit !== null ? (exit - entry) * sign : null
  const rMultiple = riskPerUnit && rewardPerUnit !== null ? rewardPerUnit / riskPerUnit : null
  return { grossPnl, pnl, rMultiple }
}

export function calculateFromForm(form: TradeForm) {
  return calculateTrade(numberOrNull(form.entry_price), numberOrNull(form.stop_loss), numberOrNull(form.exit_price), numberOrNull(form.position_size), Number(form.commission || 0), form.direction)
}

export function calculateStats(trades: Trade[]) {
  const pnl = trades.reduce((sum, t) => sum + Number(t.pnl), 0)
  const wins = trades.filter(t => Number(t.pnl) > 0)
  const losses = trades.filter(t => Number(t.pnl) < 0)
  const grossProfit = wins.reduce((sum, t) => sum + Number(t.pnl), 0)
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + Number(t.pnl), 0))
  const rTrades = trades.filter(t => t.r_multiple !== null)
  return {
    pnl, wins: wins.length, losses: losses.length,
    winrate: trades.length ? (wins.length / trades.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? Infinity : null),
    avgR: rTrades.length ? rTrades.reduce((sum, t) => sum + Number(t.r_multiple), 0) / rTrades.length : null,
  }
}
