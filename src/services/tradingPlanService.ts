import { supabase } from '../lib/supabase'
import type { TradingPlan, TradingPlanRule, TradingPlanRuleInput } from '../types/tradingPlan'

export async function fetchActiveTradingPlan(userId: string) {
  const { data, error } = await supabase
    .from('trading_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as TradingPlan | null
}

export async function createDefaultTradingPlan(userId: string) {
  const { data, error } = await supabase
    .from('trading_plans')
    .insert({ user_id: userId, name: 'Mijn Trading Plan', description: 'Mijn persoonlijke regels voor consistente uitvoering.', is_active: true })
    .select('*')
    .single()
  if (error) throw error
  return data as TradingPlan
}

export async function fetchTradingPlanRules(planId: string) {
  const { data, error } = await supabase
    .from('trading_plan_rules')
    .select('*')
    .eq('trading_plan_id', planId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as TradingPlanRule[]
}

export async function createTradingPlanRule(planId: string, userId: string, input: TradingPlanRuleInput) {
  const { data, error } = await supabase
    .from('trading_plan_rules')
    .insert({ trading_plan_id: planId, user_id: userId, category: input.category, title: input.title, description: input.description || null, enabled: input.enabled })
    .select('*')
    .single()
  if (error) throw error
  return data as TradingPlanRule
}

export async function updateTradingPlanRule(id: string, input: TradingPlanRuleInput) {
  const { data, error } = await supabase
    .from('trading_plan_rules')
    .update({ category: input.category, title: input.title, description: input.description || null, enabled: input.enabled })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as TradingPlanRule
}

export async function setTradingPlanRuleEnabled(id: string, enabled: boolean) {
  const { data, error } = await supabase
    .from('trading_plan_rules')
    .update({ enabled })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as TradingPlanRule
}

export async function removeTradingPlanRule(id: string) {
  const { error } = await supabase.from('trading_plan_rules').delete().eq('id', id)
  if (error) throw error
}
