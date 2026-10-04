import { useEffect,useMemo,useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import type { Trade,View } from './types/trade'
import { calculateStats } from './utils/tradeCalculations'
import { useTrades } from './hooks/useTrades'
import { AuthPage } from './features/auth/AuthPage'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './features/dashboard/Dashboard'
import { TradesView } from './features/trades/TradesView'
import { TradeModal } from './features/trades/TradeModal'
import { StatisticsView } from './features/statistics/StatisticsView'
import { CalendarView } from './features/calendar/CalendarView'
import { TradingPlanView } from './features/trading-plan/TradingPlanView'
import './styles/app.css'

const viewMeta: Record<View,{title:string;subtitle:string}> = {
  dashboard:{title:'Dashboard',subtitle:'Je trading performance in één overzicht.'},
  trades:{title:'Trades',subtitle:'Bekijk, bewerk en beheer je journal.'},
  statistics:{title:'Statistieken',subtitle:'Ontdek patronen in je resultaten.'},
  calendar:{title:'Kalender',subtitle:'Bekijk je resultaten per handelsdag.'},
  'trading-plan':{title:'Trading Plan',subtitle:'Leg de regels vast waaraan je jezelf tijdens het traden wilt houden.'},
}

export default function App(){
  const[session,setSession]=useState<Session|null>(null),[checking,setChecking]=useState(true),[view,setView]=useState<View>('dashboard'),[modal,setModal]=useState(false),[editing,setEditing]=useState<Trade|null>(null)
  const{trades,loading,error,reload,deleteTrade}=useTrades(session);const stats=useMemo(()=>calculateStats(trades),[trades])
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setChecking(false)});const{data:l}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);setChecking(false)});return()=>l.subscription.unsubscribe()},[])
  if(checking)return <div className="loading-screen">Trade Journal laden...</div>;if(!session)return <AuthPage/>
  const openAdd=()=>{setEditing(null);setModal(true)},openEdit=(t:Trade)=>{setEditing(t);setModal(true)};const meta=viewMeta[view]
  return <div className="app-shell"><Sidebar session={session} view={view} setView={setView} onLogout={()=>supabase.auth.signOut()}/><main className="dashboard"><header className="dashboard-header"><div><p className="eyebrow">TRADE JOURNAL</p><h1>{meta.title}</h1><p className="dashboard-subtitle">{meta.subtitle}</p></div>{view!=='trading-plan'&&<button className="add-trade-button" onClick={openAdd}>+ Trade toevoegen</button>}</header>{view!=='trading-plan'&&error&&<div className="error-banner">{error}</div>}{view==='trading-plan'?<TradingPlanView session={session}/>:loading?<div className="loading-inline">Trades laden...</div>:<>{view==='dashboard'&&<Dashboard trades={trades} stats={stats} onAdd={openAdd}/>} {view==='trades'&&<TradesView trades={trades} onDelete={deleteTrade} onEdit={openEdit} onAdd={openAdd}/>} {view==='statistics'&&<StatisticsView trades={trades} stats={stats}/>} {view==='calendar'&&<CalendarView trades={trades}/>}</>}</main>{modal&&<TradeModal session={session} trade={editing} onClose={()=>setModal(false)} onSaved={reload}/>}</div>
}
