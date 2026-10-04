import type { Session } from '@supabase/supabase-js'
import type { Theme } from '../../types/settings'
import { Icon } from '../../components/icons/Icon'

export function SettingsView({session,theme,setTheme}:{session:Session;theme:Theme;setTheme:(theme:Theme)=>void}){
  return <div className="settings-grid">
    <article className="panel settings-card"><p className="eyebrow">APPEARANCE</p><h2>Thema</h2><p className="muted">Kies hoe Trade Journal eruitziet. Je keuze wordt op dit apparaat onthouden.</p><div className="theme-options">
      <button className={`theme-card ${theme==='dark'?'active':''}`} onClick={()=>setTheme('dark')}><span className="theme-preview dark-preview"><Icon name="moon" size={22}/></span><span><strong>Dark mode</strong><small>De huidige donkere stijl</small></span>{theme==='dark'&&<Icon name="check"/>}</button>
      <button className={`theme-card ${theme==='light'?'active':''}`} onClick={()=>setTheme('light')}><span className="theme-preview light-preview"><Icon name="sun" size={22}/></span><span><strong>Light mode</strong><small>Een rustige witte variant</small></span>{theme==='light'&&<Icon name="check"/>}</button>
    </div></article>
    <article className="panel settings-card"><p className="eyebrow">ACCOUNT</p><h2>Profiel</h2><div className="settings-row"><span>E-mail</span><strong>{session.user.email}</strong></div><div className="settings-row"><span>Opslag</span><strong>Supabase</strong></div><p className="muted settings-note">Meer account- en journalinstellingen kunnen hier later worden toegevoegd.</p></article>
  </div>
}
