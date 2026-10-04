import type { Session } from '@supabase/supabase-js'
import type { View } from '../../types/trade'
import { Icon, type IconName } from '../icons/Icon'

export function Sidebar({session,view,setView,onLogout}:{session:Session;view:View;setView:(v:View)=>void;onLogout:()=>void}) {
  const primary:{key:View;label:string;icon:IconName}[]=[
    {key:'dashboard',label:'Dashboard',icon:'dashboard'},
    {key:'trades',label:'Trades',icon:'trades'},
    {key:'statistics',label:'Statistieken',icon:'statistics'},
    {key:'calendar',label:'Kalender',icon:'calendar'},
    {key:'trading-plan',label:'Trading Plan',icon:'plan'},
    {key:'weekly-review',label:'Weekreview',icon:'weekly'},
  ]
  return <aside className="sidebar"><div><div className="logo-row"><span className="brand-mark small">TJ</span><strong>Trade Journal</strong></div><nav>{primary.map(item=><button key={item.key} className={`nav-item ${view===item.key?'active':''}`} onClick={()=>setView(item.key)}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav><div className="nav-divider"/><button className={`nav-item ${view==='settings'?'active':''}`} onClick={()=>setView('settings')}><Icon name="settings"/><span>Settings</span></button></div><div className="sidebar-footer"><span className="user-email">{session.user.email}</span><button className="logout-button" onClick={onLogout}><Icon name="logout" size={16}/>Uitloggen</button></div></aside>
}
