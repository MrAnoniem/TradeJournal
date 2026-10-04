import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useTradingPlan } from '../../hooks/useTradingPlan'
import type { TradingPlanCategory, TradingPlanRule, TradingPlanRuleInput } from '../../types/tradingPlan'
import { RuleModal } from './components/RuleModal'

const categoryInfo: { key: TradingPlanCategory; title: string; subtitle: string; number: string }[] = [
  { key: 'bias', title: 'Bias Plan', subtitle: 'Wanneer heb je een duidelijke richting?', number: '01' },
  { key: 'poi', title: 'POI Plan', subtitle: 'Welke zones en context zijn geldig?', number: '02' },
  { key: 'entry', title: 'Entry Plan', subtitle: 'Wanneer mag je daadwerkelijk instappen?', number: '03' },
  { key: 'exit', title: 'Exit Plan', subtitle: 'Hoe beheer en sluit je een positie?', number: '04' },
]

export function TradingPlanView({ session }: { session: Session }) {
  const { plan, rules, loading, error, completeness, addRule, editRule, toggleRule, deleteRule } = useTradingPlan(session)
  const [modalCategory, setModalCategory] = useState<TradingPlanCategory | null>(null)
  const [editing, setEditing] = useState<TradingPlanRule | null>(null)
  const openAdd = (category: TradingPlanCategory) => { setEditing(null); setModalCategory(category) }
  const openEdit = (rule: TradingPlanRule) => { setEditing(rule); setModalCategory(rule.category) }
  const save = (input: TradingPlanRuleInput) => editing ? editRule(editing.id, input) : addRule(input)

  if (loading) return <div className="loading-inline">Trading plan laden...</div>
  return <>
    {error && <div className="error-banner">{error}{error.toLowerCase().includes('trading_plans') && <span className="migration-hint"> Voer eerst de v4 SQL-migratie uit in Supabase.</span>}</div>}
    <section className="plan-hero panel">
      <div className="plan-hero-copy"><span className="plan-kicker">ACTIEF PLAN</span><h2>{plan?.name ?? 'Mijn Trading Plan'}</h2><p>{plan?.description ?? 'Leg de regels vast waaraan je jezelf tijdens het traden wilt houden.'}</p></div>
      <div className="plan-progress"><div className="progress-number">{completeness.percentage}%</div><span>compleet</span><div className="progress-track"><div style={{width:`${completeness.percentage}%`}}/></div></div>
    </section>
    <div className="plan-status-row">{categoryInfo.map(item => <div key={item.key} className={`plan-status ${completeness.completed[item.key]?'done':''}`}><span>{completeness.completed[item.key]?'✓':'○'}</span>{item.title.replace(' Plan','')}</div>)}</div>
    <section className="plan-grid">{categoryInfo.map(item => { const categoryRules = rules.filter(rule => rule.category === item.key); const active = categoryRules.filter(rule => rule.enabled).length; return <article className="plan-card" key={item.key}><div className="plan-card-head"><div><span className="plan-number">{item.number}</span><h2>{item.title}</h2><p>{item.subtitle}</p></div><span className="rule-count">{active} actief</span></div><div className="rule-list">{categoryRules.length===0 ? <div className="rule-empty"><p>Nog geen regels vastgelegd.</p><span>Voeg je eerste concrete {item.title.toLowerCase()} regel toe.</span></div> : categoryRules.map(rule => <div className={`rule-item ${rule.enabled?'':'disabled'}`} key={rule.id}><button className={`rule-toggle ${rule.enabled?'on':''}`} onClick={()=>toggleRule(rule)} aria-label={rule.enabled?'Regel uitschakelen':'Regel inschakelen'}><span/></button><div className="rule-copy"><strong>{rule.title}</strong>{rule.description&&<p>{rule.description}</p>}</div><div className="rule-actions"><button onClick={()=>openEdit(rule)}>Bewerk</button><button className="danger-link" onClick={()=>deleteRule(rule.id)}>Verwijder</button></div></div>)}</div><button className="add-rule-button" onClick={()=>openAdd(item.key)}>+ Regel toevoegen</button></article> })}</section>
    <div className="accountability-note"><div className="note-icon">→</div><div><strong>Klaar voor accountability</strong><p>In een volgende versie kunnen trades automatisch naast deze regels worden gelegd. V4 registreert eerst je plan — zonder je te blokkeren.</p></div></div>
    {modalCategory && <RuleModal category={modalCategory} rule={editing} onClose={()=>{setModalCategory(null);setEditing(null)}} onSave={save}/>} 
  </>
}
