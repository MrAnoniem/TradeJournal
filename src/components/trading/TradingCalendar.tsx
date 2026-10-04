import { useMemo, useState } from 'react'
import type { Trade } from '../../types/trade'
import { money } from '../../utils/formatters'
import { Icon } from '../icons/Icon'

function monthStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function shiftMonth(date: Date, amount: number) { return new Date(date.getFullYear(), date.getMonth() + amount, 1) }

export function TradingCalendar({ trades, compact=false }: { trades: Trade[]; compact?: boolean }) {
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()))
  const year = visibleMonth.getFullYear(), month = visibleMonth.getMonth()
  const today = new Date()
  const byDay = useMemo(() => {
    const map = new Map<number, { pnl: number; count: number }>()
    trades.forEach(t => {
      const d = new Date(t.trade_date)
      if (d.getFullYear() !== year || d.getMonth() !== month) return
      const current = map.get(d.getDate()) ?? { pnl: 0, count: 0 }
      current.pnl += Number(t.pnl)
      current.count += 1
      map.set(d.getDate(), current)
    })
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
        {value && <><strong className={value.pnl >= 0 ? 'positive' : 'negative'}>{money(value.pnl)}</strong><small>{value.count} {value.count === 1 ? 'trade' : 'trades'}</small></>}
      </div>
    })}</div>
  </div>
}
