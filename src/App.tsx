import { useEffect,useMemo,useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import type { Trade,View } from './types/trade'
import type { Theme } from './types/settings'
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
import { SettingsView } from './features/settings/SettingsView'
import { WeeklyReviewView } from './features/weekly-review/WeeklyReviewView'
import { Icon } from './components/icons/Icon'
import './styles/app.css'

const viewMeta: Record<View,{title:string;subtitle:string}> = {
  dashboard:{title:'Dashboard',subtitle:'Je trading performance in één overzicht.'},
  trades:{title:'Trades',subtitle:'Bekijk, bewerk en beheer je journal.'},
  statistics:{title:'Statistieken',subtitle:'Ontdek patronen in je resultaten.'},
  calendar:{title:'Kalender',subtitle:'Navigeer door iedere maand en bekijk je resultaten per handelsdag.'},
  'trading-plan':{title:'Trading Plan',subtitle:'Leg de regels vast waaraan je jezelf tijdens het traden wilt houden.'},
  'weekly-review':{title:'Weekreview',subtitle:'Reflecteer op je trades en leg verbeterpunten per week vast.'},
  settings:{title:'Settings',subtitle:'Pas de uitstraling en voorkeuren van je journal aan.'},
}

export default function App(){
  const[session,setSession]=useState<Session|null>(null),[checking,setChecking]=useState(true),[view,setView]=useState<View>('dashboard'),[modal,setModal]=useState(false),[editing,setEditing]=useState<Trade|null>(null)
  const[theme,setTheme]=useState<Theme>(()=>(localStorage.getItem('tradejournal-theme') as Theme)||'dark')
  const{trades,loading,error,reload,deleteTrade}=useTrades(session);const stats=useMemo(()=>calculateStats(trades),[trades])
  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('tradejournal-theme',theme)},[theme])
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{setSession(data.session);setChecking(false)});const{data:l}=supabase.auth.onAuthStateChange((_e,s)=>{setSession(s);setChecking(false)});return()=>l.subscription.unsubscribe()},[])
  if(checking)return <div className="loading-screen">Trade Journal laden...</div>;if(!session)return <AuthPage/>
  const openAdd=()=>{setEditing(null);setModal(true)},openEdit=(t:Trade)=>{setEditing(t);setModal(true)};const meta=viewMeta[view]
  const canAddTrade=['dashboard','trades','statistics','calendar'].includes(view)
  return <div className="app-shell"><Sidebar session={session} view={view} setView={setView} onLogout={()=>supabase.auth.signOut()}/><main className="dashboard"><header className="dashboard-header"><div><p className="eyebrow">TRADE JOURNAL</p><h1>{meta.title}</h1><p className="dashboard-subtitle">{meta.subtitle}</p></div>{canAddTrade&&<button className="add-trade-button" onClick={openAdd}><Icon name="plus" size={17}/>Trade toevoegen</button>}</header>{view!=='trading-plan'&&error&&<div className="error-banner">{error}</div>}{view==='trading-plan'?<TradingPlanView session={session}/>:view==='settings'?<SettingsView session={session} theme={theme} setTheme={setTheme}/>:view==='weekly-review'?<WeeklyReviewView session={session} trades={trades}/>:loading?<div className="loading-inline">Trades laden...</div>:<>{view==='dashboard'&&<Dashboard trades={trades} stats={stats} onAdd={openAdd}/>} {view==='trades'&&<TradesView trades={trades} onDelete={deleteTrade} onEdit={openEdit} onAdd={openAdd}/>} {view==='statistics'&&<StatisticsView trades={trades} stats={stats}/>} {view==='calendar'&&<CalendarView trades={trades}/>}</>}</main>{modal&&<TradeModal session={session} trade={editing} onClose={()=>setModal(false)} onSaved={reload}/>}</div>
}
