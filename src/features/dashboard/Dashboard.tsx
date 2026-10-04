import { useState } from 'react'
import type { Stats,Trade } from '../../types/trade'
import { money,formatDate } from '../../utils/formatters'
import { Stat } from '../../components/ui/Stat'
import { Empty } from '../../components/ui/Empty'
import { EquityChart } from '../../components/trading/EquityChart'
import { TradingCalendar } from '../../components/trading/TradingCalendar'
import { TradeDetailModal } from '../trades/TradeDetailModal'

export function Dashboard({trades,stats,onAdd}:{trades:Trade[];stats:Stats;onAdd:()=>void}){
  const [selectedTrade,setSelectedTrade]=useState<Trade|null>(null)
  return <>
    <section className="stats-grid"><Stat label="Netto P&L" value={money(stats.pnl)} note={`${trades.length} trades`} tone={stats.pnl}/><Stat label="Winrate" value={`${stats.winrate.toFixed(1)}%`} note={`${stats.wins} wins / ${stats.losses} losses`}/><Stat label="Profit factor" value={stats.profitFactor===null?'—':stats.profitFactor===Infinity?'∞':stats.profitFactor.toFixed(2)} note="Brutowinst ÷ brutoverlies"/><Stat label="Gemiddelde R" value={stats.avgR===null?'—':`${stats.avgR.toFixed(2)}R`} note="Automatisch berekend" tone={stats.avgR??0}/></section>
    <section className="dashboard-grid"><article className="panel chart-panel"><p className="eyebrow">PERFORMANCE</p><h2>Equity curve</h2><EquityChart trades={trades}/></article><article className="panel"><p className="eyebrow">RECENT</p><h2>Laatste trades</h2>{trades.length?<div className="recent-list">{trades.slice(0,5).map(t=><div className="recent-row" key={t.id}><div><strong>{t.instrument}</strong><span>{t.direction} · {formatDate(t.trade_date)}</span></div><b className={Number(t.pnl)>=0?'positive':'negative'}>{money(Number(t.pnl))}</b></div>)}</div>:<Empty onAdd={onAdd}/>}</article></section>
    <section className="dashboard-calendar panel"><TradingCalendar trades={trades} compact onTradeClick={setSelectedTrade}/></section>
    {selectedTrade&&<TradeDetailModal trade={selectedTrade} onClose={()=>setSelectedTrade(null)}/>}
  </>
}
