import { useMemo, useState } from 'react'
import type { Trade } from '../../types/trade'
import { money } from '../../utils/formatters'
import { Icon } from '../icons/Icon'

type DisplayMode = 'pnl' | 'r' | 'count'
type DayTrades = { pnl: number; count: number; r: number; rCount: number; trades: Trade[] }

function monthStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function shiftMonth(date: Date, amount: number) { return new Date(date.getFullYear(), date.getMonth() + amount, 1) }
function dayKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
function tradeDayKey(value: string) { return dayKey(new Date(value)) }
function average(values: number[]) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null }

export function TradingCalendar({ trades, compact = false, onTradeClick }: { trades: Trade[]; compact?: boolean; onTradeClick?: (trade: Trade) => void }) {
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(new Date()))
  const [displayMode, setDisplayMode] = useState<DisplayMode>('pnl')
  const [selectedDay, setSelectedDay] = useState<{ date: Date; value: DayTrades } | null>(null)
  const year = visibleMonth.getFullYear()
  const month = visibleMonth.getMonth()
  const today = new Date()

  const allByDay = useMemo(() => {
    const map = new Map<string, DayTrades>()
    trades.forEach(trade => {
      const key = tradeDayKey(trade.trade_date)
      const current = map.get(key) ?? { pnl: 0, count: 0, r: 0, rCount: 0, trades: [] }
      current.pnl += Number(trade.pnl)
      current.count += 1
      if (trade.r_multiple !== null) {
        current.r += Number(trade.r_multiple)
        current.rCount += 1
      }
      current.trades.push(trade)
      map.set(key, current)
    })
    map.forEach(value => value.trades.sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()))
    return map
  }, [trades])

  const monthTrades = useMemo(() => trades.filter(trade => {
    const date = new Date(trade.trade_date)
    return date.getFullYear() === year && date.getMonth() === month
  }), [trades, year, month])

  const years = useMemo(() => {
    const values = new Set<number>([today.getFullYear(), year])
    trades.forEach(trade => values.add(new Date(trade.trade_date).getFullYear()))
    return [...values].sort((a, b) => a - b)
  }, [trades, year, today])

  const monthPnl = monthTrades.reduce((sum, trade) => sum + Number(trade.pnl), 0)
  const winningTrades = monthTrades.filter(trade => Number(trade.pnl) > 0).map(trade => Number(trade.pnl))
  const losingTrades = monthTrades.filter(trade => Number(trade.pnl) < 0).map(trade => Number(trade.pnl))
  const activeDays = new Set(monthTrades.map(trade => tradeDayKey(trade.trade_date))).size
  const averageDaily = activeDays ? monthPnl / activeDays : null
  const averageWin = average(winningTrades)
  const averageLoss = average(losingTrades)

  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const gridStart = new Date(year, month, 1 - offset)
  const rows = compact ? Math.ceil((offset + new Date(year, month + 1, 0).getDate()) / 7) : 6
  const cells = Array.from({ length: rows * 7 }, (_, index) => {
    const date = new Date(gridStart)
    date.setDate(gridStart.getDate() + index)
    return date
  })

  const title = new Intl.DateTimeFormat('nl-NL', { month: 'long' }).format(visibleMonth)
  const fullTitle = new Intl.DateTimeFormat('nl-NL', { month: 'long', year: 'numeric' }).format(visibleMonth)
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

  const selectYear = (nextYear: number) => setVisibleMonth(current => new Date(nextYear, current.getMonth(), 1))
  const goToday = () => setVisibleMonth(monthStart(new Date()))
  const openDay = (date: Date, value: DayTrades) => {
    if (!onTradeClick) return
    if (value.trades.length === 1) onTradeClick(value.trades[0])
    else setSelectedDay({ date, value })
  }

  const cellValue = (value: DayTrades) => {
    if (displayMode === 'count') return `${value.count} ${value.count === 1 ? 'trade' : 'trades'}`
    if (displayMode === 'r') return value.rCount ? `${value.r >= 0 ? '+' : ''}${value.r.toFixed(2)}R` : '—'
    return money(value.pnl)
  }
  const cellTone = (value: DayTrades) => {
    if (displayMode === 'count' || (displayMode === 'r' && !value.rCount)) return 'neutral'
    const metric = displayMode === 'r' ? value.r : value.pnl
    return metric > 0 ? 'profit' : metric < 0 ? 'loss' : 'neutral'
  }

  return <div className={`trading-calendar performance-calendar ${compact ? 'compact' : ''}`}>
    {!compact && <div className="performance-calendar-topbar">
      <label className="calendar-display-control">
        <span>Weergave</span>
        <select value={displayMode} onChange={event => setDisplayMode(event.target.value as DisplayMode)}>
          <option value="pnl">Winst / Verlies (€)</option>
          <option value="r">R-multiple</option>
          <option value="count">Aantal trades</option>
        </select>
      </label>
      <div className="calendar-year-switcher" aria-label="Jaar selecteren">
        {years.map(value => <button type="button" key={value} className={value === year ? 'active' : ''} onClick={() => selectYear(value)}>{value}</button>)}
      </div>
    </div>}

    <div className="calendar-month-navigation">
      <button className="calendar-nav-arrow" aria-label="Vorige maand" onClick={() => setVisibleMonth(date => shiftMonth(date, -1))}><Icon name="chevron-left"/></button>
      <div className="calendar-month-title"><p className="eyebrow">{compact ? 'TRADING CALENDAR' : 'MAANDOVERZICHT'}</p><h2>{compact ? fullTitle : title}</h2></div>
      <button className="calendar-today-button" type="button" aria-label="Terug naar huidige maand" onClick={goToday} disabled={isCurrentMonth}><Icon name="today" size={16}/></button>
      <button className="calendar-nav-arrow" aria-label="Volgende maand" onClick={() => setVisibleMonth(date => shiftMonth(date, 1))}><Icon name="chevron-right"/></button>
    </div>

    {compact && <div className="calendar-month-summary"><strong className={monthPnl >= 0 ? 'positive' : 'negative'}>{money(monthPnl)}</strong><span>{monthTrades.length} {monthTrades.length === 1 ? 'trade' : 'trades'} deze maand</span></div>}

    <div className="calendar-weekdays">{['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => <span key={day}>{day}</span>)}</div>
    <div className="calendar-grid">{cells.map(date => {
      const key = dayKey(date)
      const value = allByDay.get(key)
      const inMonth = date.getMonth() === month && date.getFullYear() === year
      const isToday = dayKey(date) === dayKey(today)
      const tone = value ? cellTone(value) : 'empty'
      const content = <>
        <span className="calendar-day">{date.getDate()}</span>
        <div className="calendar-cell-content">
          {value ? <><strong className={displayMode === 'count' ? '' : tone === 'profit' ? 'positive' : tone === 'loss' ? 'negative' : ''}>{cellValue(value)}</strong><small>{value.count} {value.count === 1 ? 'trade' : 'trades'}</small></> : <span className="calendar-no-trades">Geen trades</span>}
        </div>
      </>
      const className = `calendar-cell ${inMonth ? '' : 'outside-month'} ${value ? `has-trades ${tone}` : 'no-trades'} ${isToday ? 'today' : ''}`
      return value && onTradeClick ? <button type="button" className={`${className} clickable`} key={key} onClick={() => openDay(date, value)} title={value.count === 1 ? 'Trade details openen' : `${value.count} trades bekijken`}>{content}</button> : <div className={className} key={key}>{content}</div>
    })}</div>

    {!compact && <div className="calendar-monthly-stats">
      <CalendarMetric label="Gem. dagelijkse P&L" value={averageDaily === null ? '—' : money(averageDaily)} tone={averageDaily}/>
      <CalendarMetric label="Totale maand P&L" value={money(monthPnl)} tone={monthPnl}/>
      <CalendarMetric label="Gem. winnende trade" value={averageWin === null ? '—' : money(averageWin)} tone={averageWin}/>
      <CalendarMetric label="Gem. verliezende trade" value={averageLoss === null ? '—' : money(averageLoss)} tone={averageLoss}/>
    </div>}

    {selectedDay && <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setSelectedDay(null)}>
      <section className="modal calendar-day-modal" role="dialog" aria-modal="true" aria-label="Trades van geselecteerde dag">
        <div className="modal-header"><div><p className="eyebrow">DAGOVERZICHT</p><h2>{new Intl.DateTimeFormat('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' }).format(selectedDay.date)}</h2><p className="trade-detail-date">{selectedDay.value.count} {selectedDay.value.count === 1 ? 'trade' : 'trades'} · Netto resultaat: <strong className={selectedDay.value.pnl >= 0 ? 'positive' : 'negative'}>{money(selectedDay.value.pnl)}</strong></p></div><button className="close-button" onClick={() => setSelectedDay(null)} aria-label="Sluiten">×</button></div>
        <div className="calendar-day-trades">{selectedDay.value.trades.map(trade => <button type="button" key={trade.id} onClick={() => { setSelectedDay(null); onTradeClick?.(trade) }}><div><strong>{trade.instrument}</strong><span>{trade.direction} · {new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit' }).format(new Date(trade.trade_date))}</span></div><b className={Number(trade.pnl) >= 0 ? 'positive' : 'negative'}>{money(Number(trade.pnl))}</b><Icon name="chevron-right" size={16}/></button>)}</div>
      </section>
    </div>}
  </div>
}

function CalendarMetric({ label, value, tone }: { label: string; value: string; tone: number | null }) {
  return <div className="calendar-metric"><span className={tone === null ? '' : tone >= 0 ? 'metric-accent positive-accent' : 'metric-accent negative-accent'}/><div><small>{label}</small><strong className={tone === null ? '' : tone > 0 ? 'positive' : tone < 0 ? 'negative' : ''}>{value}</strong></div></div>
}
