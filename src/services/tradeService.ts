import { supabase } from '../lib/supabase'
import type { Trade } from '../types/trade'

export async function fetchTrades() {
  const { data, error } = await supabase.from('trades').select('*').order('trade_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Trade[]
}
export async function createTrade(payload: Omit<Trade, 'id'|'created_at'>) {
  const { error } = await supabase.from('trades').insert(payload)
  if (error) throw error
}
export async function updateTrade(id: string, payload: Partial<Trade>) {
  const { error } = await supabase.from('trades').update(payload).eq('id', id)
  if (error) throw error
}
export async function removeTrade(id: string) {
  const { error } = await supabase.from('trades').delete().eq('id', id)
  if (error) throw error
}
