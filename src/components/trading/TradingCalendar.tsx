import { useMemo, useState } from 'react'
import type { Trade } from '../../types/trade'
import { money } from '../../utils/formatters'
import { Icon } from '../icons/Icon'

function monthStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function shiftMonth(date: Date, amount: number) { return new Date(date.getFullYear(), date.getMonth() + amount, 1) }

type DayTrades = { pnl: number; count: number; trades: Trade[] }

export function TradingCalendar({ trades, compact=false, onTradeClick }: { trades: Trade[]; compact?: boolean; onTradeClick?: (trade: Trade) => void }) {
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()))
  const year = visibleMonth.getFullYear(), month = visibleMonth.getMonth()
  const today = new Date()
  const byDay = useMemo(() => {
    const map = new Map<number, DayTrades>()
    trades.forEach(t => {
      const d = new Date(t.trade_date)
      if (d.getFullYear() !== year || d.getMonth() !== month) return
      const current = map.get(d.getDate()) ?? { pnl: 0, count: 0, trades: [] }
      current.pnl += Number(t.pnl)
      current.count += 1
      current.trades.push(t)
      map.set(d.getDate(), current)
    })
    map.forEach(value => value.trades.sort((a,b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()))
    return map
  }, [trades, year, month])

  const first = new Date(year, month, 1)
  const days = new Date(year, month + 1, 0).getDate()
  const offset = (first.getDay() + 6) % 7
  const cellCount = compact ? Math.ceil((offset + days) / 7) * 7 : 42
  const cells: (number | null)[] = Array.from({ length: cellCount }, (_, i) => {
    const day = i - offset + 1
    return day >= 1 && day <= days ? day : null
  })
  const monthPnl = [...byDay.values()].reduce((sum, value) => sum + value.pnl, 0)
  const monthTrades = [...byDay.values()].reduce((sum, value) => sum + value.count, 0)
  const title = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(visibleMonth)
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  return <div className={`trading-calendar ${compact ? 'compact' : ''}`}>
    <div className="calendar-toolbar">
      <div>
        <p className="eyebrow">{compact ? 'TRADING CALENDAR' : 'MAANDOVERZICHT'}</p>
        <h2>{title}</h2>
      </div>
      <div className="calendar-actions">
        {!compact && <button className="icon-text-button" onClick={() => setVisibleMonth(monthStart(new Date()))} disabled={isCurrentMonth}><Icon name="today" size={15}/> Vandaag</button>}
        <button className="icon-button" aria-label="Vorige maand" onClick={() => setVisibleMonth(d => shiftMonth(d, -1))}><Icon name="chevron-left"/></button>
        <button className="icon-button" aria-label="Volgende maand" onClick={() => setVisibleMonth(d => shiftMonth(d, 1))}><Icon name="chevron-right"/></button>
      </div>
    </div>
    <div className="calendar-month-summary"><strong className={monthPnl >= 0 ? 'positive' : 'negative'}>{money(monthPnl)}</strong><span>{monthTrades} {monthTrades === 1 ? 'trade' : 'trades'} deze maand</span></div>
    <div className="calendar-weekdays">{['Ma','Di','Wo','Do','Vr','Za','Zo'].map(d => <span key={d}>{d}</span>)}</div>
    <div className="calendar-grid">{cells.map((day, i) => {
      if (day === null) return <div className="calendar-cell blank" key={`blank-${i}`}/>
      const value = byDay.get(day)
      const isToday = isCurrentMonth && today.getDate() === day
      return <div className={`calendar-cell ${value ? 'has-trades' : ''} ${isToday ? 'today' : ''}`} key={day}>
        <span className="calendar-day">{day}</span>
        {value && (!onTradeClick ? <>
          <strong className={value.pnl >= 0 ? 'positive' : 'negative'}>{money(value.pnl)}</strong>
          <small>{value.count} {value.count === 1 ? 'trade' : 'trades'}</small>
        </> : <div className="calendar-trades">
          {value.trades.slice(0, compact ? 2 : 3).map(trade => <button type="button" className="calendar-trade-pill" key={trade.id} onClick={() => onTradeClick(trade)} title={`${trade.instrument} · ${money(Number(trade.pnl))}`}>
            <span>{trade.instrument}</span><strong className={Number(trade.pnl) >= 0 ? 'positive' : 'negative'}>{money(Number(trade.pnl))}</strong>
          </button>)}
          {value.count > (compact ? 2 : 3) && <small className="calendar-more">+ {value.count - (compact ? 2 : 3)} meer</small>}
        </div>)}
      </div>
    })}</div>
  </div>
}
