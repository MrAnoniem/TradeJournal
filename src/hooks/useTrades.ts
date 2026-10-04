import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Trade } from '../types/trade'
import { fetchTrades, removeTrade } from '../services/tradeService'

export function useTrades(session: Session | null) {
  const [trades,setTrades]=useState<Trade[]>([]), [loading,setLoading]=useState(false), [error,setError]=useState('')
  const reload=useCallback(async()=>{ if(!session)return; setLoading(true);setError('');try{setTrades(await fetchTrades())}catch(e){setError(e instanceof Error?e.message:'Onbekende fout')}finally{setLoading(false)} },[session])
  useEffect(()=>{reload()},[reload])
  const deleteTrade=async(id:string)=>{if(!confirm('Weet je zeker dat je deze trade wilt verwijderen?'))return;try{await removeTrade(id);setTrades(x=>x.filter(t=>t.id!==id))}catch(e){setError(e instanceof Error?e.message:'Verwijderen mislukt')}}
  return {trades,loading,error,setError,reload,deleteTrade}
}
