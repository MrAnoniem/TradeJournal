import { useState } from 'react'
import type { Trade } from '../../types/trade'
import { TradingCalendar } from '../../components/trading/TradingCalendar'
import { TradeDetailModal } from '../trades/TradeDetailModal'

export function CalendarView({trades}:{trades:Trade[]}){
  const [selectedTrade,setSelectedTrade]=useState<Trade|null>(null)
  return <>
    <article className="panel calendar-panel"><TradingCalendar trades={trades} onTradeClick={setSelectedTrade}/></article>
    {selectedTrade&&<TradeDetailModal trade={selectedTrade} onClose={()=>setSelectedTrade(null)}/>} 
  </>
}
