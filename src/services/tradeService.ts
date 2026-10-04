import { supabase } from '../lib/supabase'
import type { Trade } from '../types/trade'
import { SCREENSHOT_BUCKET } from './screenshotService'

export async function fetchTrades() {
  const { data, error } = await supabase.from('trades').select('*').order('trade_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Trade[]
}
export async function createTrade(payload: Omit<Trade, 'id'|'created_at'>) {
  const { data, error } = await supabase.from('trades').insert(payload).select('*').single()
  if (error) throw error
  return data as Trade
}
export async function updateTrade(id: string, payload: Partial<Trade>) {
  const { data, error } = await supabase.from('trades').update(payload).eq('id', id).select('*').single()
  if (error) throw error
  return data as Trade
}
export async function removeTrade(id: string) {
  const {data:screens}=await supabase.from('trade_screenshots').select('storage_path').eq('trade_id',id)
  if(screens?.length){const {error:storageError}=await supabase.storage.from(SCREENSHOT_BUCKET).remove(screens.map(s=>s.storage_path));if(storageError)throw storageError}
  const { error } = await supabase.from('trades').delete().eq('id', id)
  if (error) throw error
}
