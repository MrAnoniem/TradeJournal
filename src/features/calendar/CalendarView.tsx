import { useState } from 'react'
import type { Trade } from '../../types/trade'
import { TradingCalendar } from '../../components/trading/TradingCalendar'
import { TradeDetailModal } from '../trades/TradeDetailModal'

export function CalendarView({trades,onEdit}:{trades:Trade[];onEdit:(trade:Trade)=>void}){
  const [selectedTrade,setSelectedTrade]=useState<Trade|null>(null)
  const editSelected=(trade:Trade)=>{setSelectedTrade(null);onEdit(trade)}
  return <>
    <article className="panel calendar-panel"><TradingCalendar trades={trades} onTradeClick={setSelectedTrade}/></article>
    {selectedTrade&&<TradeDetailModal trade={selectedTrade} onClose={()=>setSelectedTrade(null)} onEdit={editSelected}/>} 
  </>
}
