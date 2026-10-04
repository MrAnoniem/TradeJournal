import { useMemo, useState, type PointerEvent } from 'react'
import type { Trade } from '../../types/trade'
import { formatDate, money } from '../../utils/formatters'

const W=720,H=250,L=62,R=20,T=18,B=44

export function EquityChart({trades}:{trades:Trade[]}){
  const [hover,setHover]=useState<number|null>(null)
  const data=useMemo(()=>{
    let equity=0
    return [...trades].sort((a,b)=>new Date(a.trade_date).getTime()-new Date(b.trade_date).getTime()).map(t=>({trade:t,equity:equity+=Number(t.pnl)}))
  },[trades])
  if(!data.length)return <div className="empty-chart"><p>Voeg je eerste trade toe om je equity curve te zien.</p></div>
  const all=[0,...data.map(d=>d.equity)], minRaw=Math.min(...all),maxRaw=Math.max(...all),pad=Math.max((maxRaw-minRaw)*.12,1),min=minRaw-pad,max=maxRaw+pad,range=max-min||1
  const x=(i:number)=>L+(i/Math.max(data.length,1))*(W-L-R)
  const y=(v:number)=>T+(1-(v-min)/range)*(H-T-B)
  const pts=[{x:L,y:y(0)},...data.map((d,i)=>({x:x(i+1),y:y(d.equity)}))]
  const poly=pts.map(p=>`${p.x},${p.y}`).join(' ')
  const area=`${L},${H-B} ${poly} ${pts.at(-1)!.x},${H-B}`
  const grid=[0,.25,.5,.75,1].map(f=>({value:max-f*range,y:T+f*(H-T-B)}))
  const onMove=(e:PointerEvent<SVGSVGElement>)=>{const rect=e.currentTarget.getBoundingClientRect(),px=(e.clientX-rect.left)/rect.width*W,idx=Math.round((px-L)/(W-L-R)*data.length)-1;setHover(Math.max(0,Math.min(data.length-1,idx)))}
  const active=hover===null?null:data[hover], activePt=hover===null?null:pts[hover+1]
  return <div className="equity-chart-shell">
    <div className="equity-chart-stage">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Interactieve equity curve" onPointerMove={onMove} onPointerLeave={()=>setHover(null)}>
        {grid.map((g,i)=><g key={i}><line x1={L} x2={W-R} y1={g.y} y2={g.y} className="chart-gridline"/><text x={L-10} y={g.y+4} className="chart-axis-label" textAnchor="end">{money(g.value)}</text></g>)}
        <polygon points={area} className="equity-area"/>
        <polyline points={poly} className="equity-line"/>
        {data.map((d,i)=><circle key={d.trade.id} cx={pts[i+1].x} cy={pts[i+1].y} r={hover===i?5:3} className={hover===i?'equity-point active':'equity-point'}/>) }
        {activePt&&<line x1={activePt.x} x2={activePt.x} y1={T} y2={H-B} className="hover-guide"/>}
      </svg>
      {active&&activePt&&<div className="chart-tooltip" style={{left:`${activePt.x/W*100}%`,top:`${activePt.y/H*100}%`}}>
        <strong>{active.trade.instrument} · {active.trade.direction}</strong>
        <span>{formatDate(active.trade.trade_date)}</span>
        <div><span>Trade P&amp;L</span><b className={Number(active.trade.pnl)>=0?'positive':'negative'}>{money(Number(active.trade.pnl))}</b></div>
        <div><span>Equity</span><b>{money(active.equity)}</b></div>
        <div><span>R</span><b>{active.trade.r_multiple===null?'—':`${Number(active.trade.r_multiple).toFixed(2)}R`}</b></div>
      </div>}
    </div>
    <div className="chart-footer"><span>Start €0</span><strong className={data.at(-1)!.equity>=0?'positive':'negative'}>{money(data.at(-1)!.equity)}</strong></div>
  </div>
}
