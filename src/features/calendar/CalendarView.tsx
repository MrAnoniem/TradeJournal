import type { Trade } from '../../types/trade'
import { TradingCalendar } from '../../components/trading/TradingCalendar'

export function CalendarView({trades}:{trades:Trade[]}){
  return <article className="panel calendar-panel"><TradingCalendar trades={trades}/></article>
}
