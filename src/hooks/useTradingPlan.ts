import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { PlanCompleteness, TradingPlan, TradingPlanCategory, TradingPlanRule, TradingPlanRuleInput } from '../types/tradingPlan'
import { createDefaultTradingPlan, createTradingPlanRule, fetchActiveTradingPlan, fetchTradingPlanRules, removeTradingPlanRule, setTradingPlanRuleEnabled, updateTradingPlanRule } from '../services/tradingPlanService'

const categories: TradingPlanCategory[] = ['bias', 'poi', 'entry', 'exit']

export function useTradingPlan(session: Session | null) {
  const [plan, setPlan] = useState<TradingPlan | null>(null)
  const [rules, setRules] = useState<TradingPlanRule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!session) return
    setLoading(true); setError('')
    try {
      let current = await fetchActiveTradingPlan(session.user.id)
      if (!current) current = await createDefaultTradingPlan(session.user.id)
      setPlan(current)
      setRules(await fetchTradingPlanRules(current.id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Trading plan laden mislukt')
    } finally { setLoading(false) }
  }, [session])

  useEffect(() => { reload() }, [reload])

  const completeness = useMemo<PlanCompleteness>(() => {
    const completed = Object.fromEntries(categories.map(category => [category, rules.some(rule => rule.category === category && rule.enabled)])) as Record<TradingPlanCategory, boolean>
    const count = categories.filter(category => completed[category]).length
    return { percentage: count * 25, completed }
  }, [rules])

  const addRule = async (input: TradingPlanRuleInput) => {
    if (!session || !plan) return
    try { const created = await createTradingPlanRule(plan.id, session.user.id, input); setRules(current => [...current, created]) }
    catch (e) { setError(e instanceof Error ? e.message : 'Regel toevoegen mislukt'); throw e }
  }
  const editRule = async (id: string, input: TradingPlanRuleInput) => {
    try { const updated = await updateTradingPlanRule(id, input); setRules(current => current.map(rule => rule.id === id ? updated : rule)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Regel wijzigen mislukt'); throw e }
  }
  const toggleRule = async (rule: TradingPlanRule) => {
    try { const updated = await setTradingPlanRuleEnabled(rule.id, !rule.enabled); setRules(current => current.map(item => item.id === rule.id ? updated : item)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Regel wijzigen mislukt') }
  }
  const deleteRule = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze tradingregel wilt verwijderen?')) return
    try { await removeTradingPlanRule(id); setRules(current => current.filter(rule => rule.id !== id)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Regel verwijderen mislukt') }
  }

  return { plan, rules, loading, error, completeness, addRule, editRule, toggleRule, deleteRule, reload }
}
