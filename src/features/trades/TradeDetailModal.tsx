import { useEffect, useState } from 'react'
import type { Trade } from '../../types/trade'
import type { TradeScreenshot } from '../../types/screenshot'
import { listTradeScreenshots } from '../../services/screenshotService'
import { formatDate, money } from '../../utils/formatters'
import { Icon } from '../../components/icons/Icon'

const number = (value:number|null) => value === null ? '—' : String(value)

export function TradeDetailModal({trade,onClose}:{trade:Trade;onClose:()=>void}){
  const [screenshots,setScreenshots]=useState<TradeScreenshot[]>([])
  const [loadingScreenshots,setLoadingScreenshots]=useState(true)

  useEffect(()=>{
    let active=true
    setLoadingScreenshots(true)
    listTradeScreenshots(trade.id)
      .then(items=>{if(active)setScreenshots(items)})
      .catch(()=>{if(active)setScreenshots([])})
      .finally(()=>{if(active)setLoadingScreenshots(false)})
    return()=>{active=false}
  },[trade.id])

  const dateTime=new Intl.DateTimeFormat('nl-NL',{day:'2-digit',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(trade.trade_date))

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <section className="modal trade-detail-modal" role="dialog" aria-modal="true" aria-label={`Trade ${trade.instrument}`}>
      <div className="modal-header">
        <div><p className="eyebrow">TRADE DETAILS</p><h2>{trade.instrument} · {trade.direction}</h2><p className="trade-detail-date">{dateTime}</p></div>
        <button className="close-button" onClick={onClose} aria-label="Sluiten">×</button>
      </div>

      <div className="trade-detail-hero">
        <div><span>Netto P&amp;L</span><strong className={Number(trade.pnl)>=0?'positive':'negative'}>{money(Number(trade.pnl))}</strong></div>
        <div><span>R-multiple</span><strong>{trade.r_multiple===null?'—':`${Number(trade.r_multiple).toFixed(2)}R`}</strong></div>
        <div><span>Setup</span><strong>{trade.setup||'—'}</strong></div>
      </div>

      <div className="trade-detail-grid">
        <Detail label="Datum" value={formatDate(trade.trade_date)}/>
        <Detail label="Richting" value={trade.direction}/>
        <Detail label="Entry" value={number(trade.entry_price)}/>
        <Detail label="Exit" value={number(trade.exit_price)}/>
        <Detail label="Stop loss" value={number(trade.stop_loss)}/>
        <Detail label="Take profit" value={number(trade.take_profit)}/>
        <Detail label="Positiegrootte" value={number(trade.position_size)}/>
        <Detail label="Commissie / fees" value={money(Number(trade.commission??0))}/>
      </div>

      <div className="trade-detail-section">
        <div className="section-heading"><div><label>Notities</label></div><Icon name="edit" size={17}/></div>
        <div className="trade-detail-notes">{trade.notes||'Geen notities toegevoegd.'}</div>
      </div>

      <div className="trade-detail-section">
        <div className="section-heading"><div><label>Screenshots</label><small>Gekoppeld aan deze trade</small></div><Icon name="image"/></div>
        {loadingScreenshots ? <div className="trade-detail-empty">Screenshots laden...</div> : screenshots.length ? <div className="screenshot-grid trade-detail-screenshots">{screenshots.map(item=><a className="screenshot-thumb" key={item.id} href={item.url} target="_blank" rel="noreferrer" title="Open screenshot groot">{item.url?<img src={item.url} alt={item.file_name}/>:<div className="image-placeholder"><Icon name="image"/></div>}<div className="screenshot-meta"><span>{item.file_name}</span><Icon name="chevron-right" size={14}/></div></a>)}</div> : <div className="trade-detail-empty">Geen screenshots toegevoegd.</div>}
      </div>

      <div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Sluiten</button></div>
    </section>
  </div>
}

function Detail({label,value}:{label:string;value:string}){
  return <div className="trade-detail-item"><span>{label}</span><strong>{value}</strong></div>
}
