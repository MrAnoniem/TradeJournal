import { useEffect,useMemo,useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Trade } from '../../types/trade'
import { calculateStats } from '../../utils/tradeCalculations'
import { money } from '../../utils/formatters'
import { fetchWeeklyReview,saveWeeklyReview } from '../../services/weeklyReviewService'
import { Icon } from '../../components/icons/Icon'

const monday=(date:Date)=>{const d=new Date(date);d.setHours(0,0,0,0);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return d}
const dateKey=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
const shift=(date:Date,days:number)=>{const d=new Date(date);d.setDate(d.getDate()+days);return d}
export function WeeklyReviewView({session,trades}:{session:Session;trades:Trade[]}){
 const[week,setWeek]=useState(()=>monday(new Date())),[notes,setNotes]=useState(''),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState('')
 const weekEnd=shift(week,6),key=dateKey(week)
 const weekTrades=useMemo(()=>{const start=week.getTime(),end=shift(week,7).getTime();return trades.filter(t=>{const x=new Date(t.trade_date).getTime();return x>=start&&x<end})},[trades,week])
 const stats=useMemo(()=>calculateStats(weekTrades),[weekTrades])
 useEffect(()=>{let live=true;setLoading(true);setMessage('');fetchWeeklyReview(key).then(r=>{if(live)setNotes(r?.notes??'')}).catch(()=>{if(live)setMessage('Voer eerst de v4.1 SQL-migratie uit om weekreviews op te slaan.')}).finally(()=>live&&setLoading(false));return()=>{live=false}},[key])
 const save=async()=>{setSaving(true);setMessage('');try{await saveWeeklyReview(session.user.id,key,notes);setMessage('Weekreview opgeslagen.')}catch{setMessage('Opslaan mislukt. Controleer of de v4.1 migratie is uitgevoerd.')}finally{setSaving(false)}}
 const label=`${new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short'}).format(week)} – ${new Intl.DateTimeFormat('nl-NL',{day:'numeric',month:'short',year:'numeric'}).format(weekEnd)}`
 return <><article className="panel week-hero"><div><p className="eyebrow">WEKELIJKSE ANALYSE</p><h2>{label}</h2><p className="muted">Kijk terug op je uitvoering en noteer wat je volgende week wilt verbeteren.</p></div><div className="week-nav"><button className="icon-button" onClick={()=>setWeek(w=>shift(w,-7))}><Icon name="chevron-left"/></button><button className="icon-text-button" onClick={()=>setWeek(monday(new Date()))}><Icon name="today" size={15}/> Deze week</button><button className="icon-button" onClick={()=>setWeek(w=>shift(w,7))}><Icon name="chevron-right"/></button></div></article>
 <section className="stats-grid weekly-stats"><div className="stat-card"><span>Trades</span><strong>{weekTrades.length}</strong><small>Deze week</small></div><div className="stat-card"><span>Netto P&amp;L</span><strong className={stats.pnl>0?'positive':stats.pnl<0?'negative':''}>{money(stats.pnl)}</strong><small>Weekresultaat</small></div><div className="stat-card"><span>Winrate</span><strong>{stats.winrate.toFixed(1)}%</strong><small>{stats.wins} wins / {stats.losses} losses</small></div><div className="stat-card"><span>Gemiddelde R</span><strong>{stats.avgR===null?'—':`${stats.avgR.toFixed(2)}R`}</strong><small>Trades met stop loss</small></div></section>
 <section className="weekly-grid"><article className="panel"><p className="eyebrow">REFLECTIE</p><h2>Weekreview</h2><textarea className="weekly-notes" rows={12} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Wat ging goed? Welke fouten kwamen terug? Wat wordt je focus voor volgende week?" disabled={loading}/>{message&&<p className="save-message">{message}</p>}<button className="add-trade-button" onClick={save} disabled={saving||loading}><Icon name="save" size={16}/>{saving?'Opslaan...':'Review opslaan'}</button></article>
 <article className="panel"><p className="eyebrow">TRADES</p><h2>Deze week</h2>{weekTrades.length?<div className="recent-list">{weekTrades.map(t=><div className="recent-row" key={t.id}><div><strong>{t.instrument}</strong><span>{new Intl.DateTimeFormat('nl-NL',{weekday:'short',day:'numeric',month:'short'}).format(new Date(t.trade_date))} · {t.direction}</span></div><b className={Number(t.pnl)>=0?'positive':'negative'}>{money(Number(t.pnl))}</b></div>)}</div>:<div className="empty-state mini"><strong>Geen trades</strong><p>Voor deze week zijn nog geen trades opgeslagen.</p></div>}</article></section></>
}
